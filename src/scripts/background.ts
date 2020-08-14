/**
 * This script is run in the background by the browser as defined in the extension
 * manifest. In chromium-based browsers it will run as an event page whereas in
 * firefox it will be persistent as firefox does not supportevent pages.
 *
 * All handling of browser events should be handled in this module to the
 * extent that it's possible. Messages can be passed through the background
 * script to enable communication between the content script and iframes or
 * the popup and the content script.
 * */
import { actions as StoredSafeActions } from '../model/storedsafe/StoredSafe'
import { actions as SettingsActions } from '../model/storage/Settings'
import { actions as TabResultsActions } from '../model/storage/TabResults'
import { actions as BlacklistActions } from '../model/storage/Blacklist'
import { actions as SessionsActions } from '../model/storage/Sessions'

/**
 * START REFACTORED CODE
 * TODO: Remove comment
 */
import Logger from '../utils/Logger'
import {
  IdleHandler,
  KeepAliveHandler,
  TimeoutHandler,
  OnlineStatusHandler
} from './background/sessionHandler'

const logger = new Logger('Background')
logger.log('Background script initialized: ', new Date(Date.now()))

// Invalidate sessions after being idle for some time
const idleHandler = new IdleHandler()
browser.idle.onStateChanged.addListener(idleHandler.onIdleChange)

KeepAliveHandler.StartTracking()
TimeoutHandler.StartTracking()
OnlineStatusHandler.StartTracking()

/**
 * END REFACTORED CODE
 * TODO: Remove comment
 */

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
 * Message handler for specific types of messages.
 * @param data - Data as determined by the message type.
 * @param sender - Script or tab that sent the message.
 * */
type MessageHandler<T> = (
  data: T,
  sender: browser.runtime.MessageSender
) => Promise<any>

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
    if (sessions.size === 0) {
      console.log('no sessions found, return')
      return
    }

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

    // Track current URL so that iframe only appears on the current tab.
    let currentUrl = url
    function onTabUpdate (tabId: number, changeInfo: { url: string }) {
      if (tabId === id && changeInfo.url !== undefined) {
        currentUrl = changeInfo.url
      }
    }
    browser.tabs.onUpdated.addListener(onTabUpdate)

    let savePort: browser.runtime.Port
    let injectPort: browser.runtime.Port
    values = { name: title, url: urlToNeedle(url), ...values }
    function onConnect (port: browser.runtime.Port) {
      if (port.sender?.url === browser.runtime.getURL('index.html') + '#save') {
        if (savePort === undefined) {
          savePort = port
          console.log('SEND SAVE FILL')
          port.postMessage({
            type: 'save.fill',
            sender: 'background',
            data: values
          })
        } else if (injectPort) {
          console.log('SEND CLOSE FILL')
          injectPort.postMessage({
            type: 'save.close',
            sender: 'background'
          })
          console.log('disconnect port')
          port.disconnect()
          browser.tabs.onUpdated.removeListener(onTabUpdate)
        }
      } else if (port.sender?.url === url) {
        injectPort = port
        console.log('SEND SAVE OPEN')
        injectPort.postMessage({
          type: 'save.open',
          sender: 'background'
        })
      }

      port.onDisconnect.addListener(port => {
        if (
          port.sender?.url ===
          browser.runtime.getURL('index.html') + '#save'
        ) {
          savePort = undefined
        }
      })
    }
    browser.runtime.onConnect.addListener(onConnect)
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
  console.log('MESSAGE', message, sender)
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

// React to messages from other parts of the extension
browser.runtime.onMessage.addListener(onMessage)

// React to keyboard commands defined in the extension manifest
browser.commands.onCommand.addListener(onCommand)
