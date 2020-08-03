/**
 * This script is run in the background by the browser as defined in the
 * extension manifest. In chrome it will run as an event page whereas in
 * firefox it will be persistent as firefox does not support event pages.
 *
 * All handling of browser events should be handled in this module to the
 * extent that it's possible. Message handling from the popup to the content
 * script can bypass the background script but messages from the content script
 * to the popup should be passed through the background script to ensure the
 * popup is available.
 * */
import { actions as StoredSafeActions } from '../model/storedsafe/StoredSafe'
import { actions as SessionsActions } from '../model/storage/Sessions'
import { actions as SettingsActions } from '../model/storage/Settings'
import { actions as TabResultsActions } from '../model/storage/TabResults'
import { actions as BlacklistActions } from '../model/storage/Blacklist'

// /////////////////////////////////////////////////////////
// Session management functions and initialization

// Timers for invalidating sessions.
let sessionTimers: Map<string /* host */, number> = new Map()
let idleTimer: number

/**
 * Invalidate a single session and destroy all cached search results for
 * that host.
 * @param host - Host of session to invalidate.
 * */
async function invalidateSession (host: string): Promise<void> {
  const logoutPromise = StoredSafeActions.logout(host)
  const purgePromise = TabResultsActions.purgeHost(host)
  await logoutPromise
  await purgePromise
}

/**
 * Invalidate all sessions and clear search results.
 * */
async function invalidateAllSessions (): Promise<void> {
  const logoutPromise = StoredSafeActions.logoutAll()
  const clearPromise = TabResultsActions.clear()
  await logoutPromise
  await clearPromise
}

/**
 * Helper function to get the amount of milliseconds since the token was
 * created.
 * */
function getTokenLife (createdAt: number): number {
  return Date.now() - createdAt
}

/**
 * Set up check timers to keep sessions alive.
 * */
function setupKeepAlive (): void {
  void (async () => {
    const sessions = await SessionsActions.fetch()
    for (const [host, { timeout }] of sessions) {
      // Perform initial check in case we're picking up an old session
      // which will timeout in less than the saved timeout value.
      await StoredSafeActions.check(host)
      const interval = timeout * 0.75 // Leave a little margin
      setInterval(() => {
        console.log('Keepalive for', host)
        StoredSafeActions.check(host).catch(error => {
          console.error(error)
        })
      }, interval)
    }
  })()
}

/**
 * Set up hard timers for session logout.
 * @param sessions - Currently active sessions.
 * */
function setupTimers (sessions: Sessions): void {
  void (async () => {
    const settings = await SettingsActions.fetch()
    for (const [host, session] of sessions) {
      const tokenLife = getTokenLife(session.createdAt)
      const maxTokenLife = settings.get('maxTokenLife').value as number
      const tokenTimeout = maxTokenLife * 3600 * 10e3 - tokenLife
      sessionTimers.set(
        host,
        window.setTimeout(() => {
          console.log('Maximum token lifetime reached for', host)
          void invalidateSession(host)
        }, tokenTimeout)
      )
    }
  })()
}

/**
 * Helper function to convert a url to a search string.
 * ex. https://foo.example.com/home -> foo.example.com
 * @param url URL to convert into search string.
 * @returns Search string.
 * */
function urlToNeedle (url: string): string {
  const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^/]*)\//i)
  return match !== null ? match[1] : url
}

/**
 * Helper function to select the first result of all results if a result exists.
 * @param results - All search results related to tab.
 * TODO: Sort results on best match?
 * */
function selectResult (results: Results): [string /* host */, SSObject] {
  for (const [host, ssObjects] of results) {
    if (ssObjects.length > 0) {
      return [host, ssObjects[0]]
    }
  }
  return [undefined, undefined]
}

/**
 * Decrypt result if needed.
 * */
async function decryptResult (
  host: string,
  result: SSObject
): Promise<SSObject> {
  if (result.isDecrypted) return result
  const hasEncrypted = result.fields.reduce(
    (acc, field) => acc || field.isEncrypted,
    false
  )
  if (hasEncrypted) {
    return await StoredSafeActions.decrypt(host, result.id)
  }
  return result
}

/**
 * Prepare fields for fill function and decrypt if needed.
 * */
function parseResult (
  result: SSObject
): Map<string /* field */, string /* value */> {
  const data: Map<string, string> = new Map()
  for (const field of result.fields) {
    data.set(field.name, field.value)
  }
  return data
}

/**
 * Fill form fields on tab.
 * */
async function tabFill (
  tabId: number,
  data: Map<string /* field */, string /* value */>
): Promise<void> {
  await browser.tabs.sendMessage(tabId, {
    type: 'fill',
    data: [...data]
  })
}

/**
 * Parse and select result and decrypt as needed before filling form fields on tab.
 * */
async function fill (tabId: number, results: Results): Promise<void> {
  const [host, result] = selectResult(results)
  if (result !== undefined) {
    const decryptedResult = decryptResult(host, result)
    const data = parseResult(await decryptedResult)
    await tabFill(tabId, data)
  }
}

/**
 * Find search results related to loaded tab.
 * @param tab - Tab to send fill message to.
 * @param fillForm - Optionally force any matching forms to be filled.
 * */
async function tabFind (
  tab: browser.tabs.Tab,
  fillForm = false
): Promise<void> {
  const { id: tabId, url } = tab
  const needle = urlToNeedle(url)
  const tabResults = await StoredSafeActions.tabFind(tabId, needle)
  if (fillForm) {
    return await fill(tabId, tabResults.get(tabId))
  }
  const settings = await SettingsActions.fetch()
  if (settings.get('autoFill').value === true) {
    await fill(tabId, tabResults.get(tabId))
  }
}

/**
 * Copy text to clipboard and clear clipboard after some amount of time.
 * @param value - Value to be copied to clipboard.
 * @param clearTimer - Time to clear clipboard in ms.
 * TODO: Fix clear timer when not focused.
 * */
async function copyToClipboard (
  value: string,
  clearTimer = 10e5
): Promise<void> {
  await navigator.clipboard.writeText(value)
  setTimeout(() => {
    navigator.clipboard.writeText('').catch(error => {
      console.error(error)
    })
  }, clearTimer)
}

/// /////////////////////////////////////////////////////////
// Event handler functions

/**
 * Update visual online indicators.
 * @param sessions - Currently active sessions.
 * */
function updateOnlineStatus (sessions: Sessions): void {
  if (sessions.size > 0) {
    browser.browserAction.setIcon({ path: 'ico/icon.png' }).catch(error => {
      console.error(error)
    })
  } else {
    void browser.browserAction
      .setIcon({ path: 'ico/icon-inactive.png' })
      .catch(error => {
        console.error(error)
      })
  }
}

/**
 * Check validity of all sessions when browser starts up.
 * */
function onStartup (): void {
  void (async () => {
    const sessions = await StoredSafeActions.checkAll()
    setupTimers(sessions)
    updateOnlineStatus(sessions)
  })()
}

/**
 * Handle updates in session storage.
 * @param sessions - currently active sessions.
 * */
function handleSessionsChange (sessions: Sessions): void {
  updateOnlineStatus(sessions)
  for (const timer of sessionTimers.values()) {
    clearTimeout(timer)
  }
  sessionTimers = new Map()
  setupTimers(sessions)
}

/**
 * Handle changes in storage.
 * @param storage - Storage change object.
 * @param area - Storage area where the change occured.
 * */
function onStorageChange (
  storage: { [key: string]: browser.storage.StorageChange },
  area: 'local' | 'sync' | 'managed'
): void {
  // Local area storage
  if (area === 'local') {
    const { sessions } = storage
    // If there are changes to sessions
    if (sessions?.newValue !== undefined) {
      handleSessionsChange(new Map(sessions.newValue))
    }
  }
}

/**
 * Handle on install event.
 * */
function onInstalled ({
  reason
}: {
  reason: browser.runtime.OnInstalledReason
}): void {
  // Run online status initialization logic
  void (async () => {
    const sessions = await SessionsActions.fetch()
    updateOnlineStatus(sessions)
  })()
}

/**
 * Clear timeout function for idle timer.
 * */
function clearIdleTimer (): void {
  console.log('Clearing idle timer')
  window.clearTimeout(idleTimer)
  idleTimer = undefined
}

/**
 * Set up timer to invalidate all sessions after being idle for some time.
 * */
function setupIdleTimer (): void {
  void (async () => {
    const settings = await SettingsActions.fetch()
    // Clear old timer if one exists.
    if (idleTimer !== undefined) {
      clearIdleTimer()
    }
    const idleTimeout = (settings.get('idleMax').value as number) * 6e4
    console.log(
      'Starting idle timer, logout in',
      idleTimeout,
      'ms (',
      idleTimeout / 6e4,
      'minutes)'
    )
    idleTimer = window.setTimeout(() => {
      console.log('Invalidating all sessions due to inactivity.')
      invalidateAllSessions().catch(error => {
        console.error(error)
      })
    }, idleTimeout)
  })()
}

/**
 * Handle changes in idle state to lock sessions after some time.
 * @param state - New browser state.
 * */
function onIdle (state: 'idle' | 'locked' | 'active'): void {
  if (state === 'idle') {
    setupIdleTimer()
  } else if (state === 'active') {
    if (idleTimer !== undefined) {
      clearIdleTimer()
    }
  }
}

/**
 * Open extension popup, silence error if popup is already open.
 * */
async function tryOpenPopup (): Promise<void> {
  try {
    await browser.browserAction.openPopup()
  } catch {
    return await Promise.resolve()
  }
}

/**
 * Message handler for specific types of messages.
 * @param data - Data as determined by the message type.
 * @param sender - Script or tab that sent the message.
 * */
type MessageHandler<T> = (
  data: T,
  sender: browser.runtime.MessageSender
) => Promise<void>

/**
 * Mapped responses to message types.
 * */
const messageHandlers: {
  tabSearch: MessageHandler<void>
  copyToClipboard: MessageHandler<string>
  submit: MessageHandler<Record<string, string>>
  toggle: MessageHandler<void>
  [key: string]: MessageHandler<unknown>
} = {
  tabSearch: async (data, sender) => await tabFind(sender.tab),
  copyToClipboard: async value => await copyToClipboard(value),
  submit: async (values, sender) => {
    const { title, url, id } = sender.tab

    // If user is not online, don't offer to save
    const sessions = await SessionsActions.fetch()
    if (sessions.size === 0) return

    // If site is blacklisted, don't offer to save
    const blacklist = await BlacklistActions.fetch()
    if (blacklist.includes(url)) return

    // If result with username for site exists in cache, don't offer to save
    const tabResults = await TabResultsActions.fetch()
    for (const results of tabResults.get(id).values()) {
      for (const result of results) {
        for (const { value } of result.fields) {
          if (value === undefined) continue
          if (value.match(urlToNeedle(url)) !== null) {
            const username = result.fields.find(
              ({ name }) => name === 'username'
            ).value
            if (username === values['username']) {
              return
            }
          }
        }
      }
    }

    const sendSaveMessage = async (): Promise<void> => {
      values = { name: title, url: urlToNeedle(url), ...values }
      await browser.tabs.sendMessage(id, {
        type: 'open-save',
        data: values
      })
    }

    async function save (tabId: number, { status }: { status: string }) {
      if (status === 'complete') {
        await sendSaveMessage()
        browser.tabs.onUpdated.removeListener(save)
      }
    }

    browser.tabs.onUpdated.addListener(save)
  },
  toggle: async (data, sender) => {
    browser.tabs.sendMessage(sender.tab.id, {
      type: 'toggle'
    })
  }
}

/**
 * Handle messages received from other scripts.
 * */
async function onMessage (
  message: {
    type: string
    data: unknown
  },
  sender: browser.runtime.MessageSender
): Promise<void> {
  const handler = messageHandlers[message.type]
  if (handler !== undefined) {
    return await handler(message.data, sender)
  }
  // throw new Error(`Invalid message type: ${message.type}`) // other scripts can get messages
}

function onCommand (command: string): void {
  if (command === 'fill') {
    void (async () => {
      const [tab] = await browser.tabs.query({
        currentWindow: true,
        active: true
      })
      await tabFind(tab, true)
    })()
  }
}

/// /////////////////////////////////////////////////////////
// Subscribe to events and initialization

// TODO: Remove debug printout
console.log('Background script initialized: ', new Date(Date.now()))

// Listen to changes in storage to know when sessions are updated
browser.storage.onChanged.addListener(onStorageChange)

// Handle startup logic, check status of existing sessions.
browser.runtime.onStartup.addListener(onStartup)

// On install logic, set up initial state
browser.runtime.onInstalled.addListener(onInstalled)

// Invalidate sessions after being idle for some time
browser.idle.onStateChanged.addListener(onIdle)

// React to messages from other parts of the extension
browser.runtime.onMessage.addListener(onMessage)

// React to keyboard commands defined in the extension manifest
browser.commands.onCommand.addListener(onCommand)

// Keep StoredSafe session alive or invalidate dead sessions.
setupKeepAlive()
