import { getMessage, LocalizedMessage } from '../global/i18n'
import { preferences, sessions, settings } from '../global/storage'
import { auth, vault } from '../global/api'
import { hardTimeout, idleInterval, keepAlive, onlineStatus } from './tasks'
import {
  ALARM_HARD_TIMEOUT,
  ALARM_KEEP_ALIVE,
  splitAlarmName
} from './constants'
import type { Message } from '../global/messages'
import { saveFlow } from './flows/saveFlow'
import { autoSearch } from './tasks/autoSearch'
import { stripURL } from '../global/storage/preferences'

console.log('BACKGROUND - %s', getMessage(LocalizedMessage.EXTENSION_NAME))

/**
 * Invalidate all sessions.
 */
function logoutAll (): void {
  sessions
    .get()
    .then(sessions => {
      for (const [host, session] of sessions) {
        auth.logout(host, session.token).catch(console.error)
      }
    })
    .catch(console.error)
}

/**
 * Set the browser action icon to reflect the online status.
 * @param isOnline `true` if at least one active session exists.
 */
function setIcon (isOnline: boolean): void {
  const icon = isOnline ? 'icon' : 'icon-inactive'
  browser.browserAction.setIcon({
    path: {
      48: `assets/${icon}_48.png`,
      96: `assets/${icon}_96.png`
    }
  })
}

/**
 * Handle changes to idle state.
 * @param state New idle state.
 */
function onIdle (state: browser.idle.IdleState): void {
  if (state === 'idle') {
    console.debug('State changed to idle, invalidating all sessions.')
    logoutAll()
  }
}

/**
 * Used instead of setTimeout and setInterval for event based background page.
 * @param alarmInfo Alarm metadata.
 */
function onAlarm (alarmInfo: browser.alarms.Alarm) {
  const [name, ...parts] = splitAlarmName(alarmInfo.name)
  switch (name) {
    case ALARM_KEEP_ALIVE: {
      const [host, token] = parts
      console.debug('Keepalive triggered for %s', host)
      auth.check(host, token).catch(console.error)
      break
    }
    case ALARM_HARD_TIMEOUT: {
      const [host, token] = parts
      console.debug(`Hard timeout, invalidating session for ${host}`)
      auth.logout(host, token).catch(console.error)
    }
  }
}

async function sendToActiveTab (message: Message): Promise<void> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  browser.tabs.sendMessage(tab.id, message)
}

async function autoFill () {
  const values: Record<string, string> = {}
  const message: Message = {
    context: 'fill',
    action: 'fill',
    data: values
  }
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(async ([tab]) => {
      let id = 0
      const currentPreferences = await preferences.get()
      const fillPreferences = currentPreferences.autoFill.get(stripURL(tab.url))

      let counter = 3
      while (!currentTabResults.has(tab.id) && counter-- > 0) {
        await new Promise(res => {
          setTimeout(() => {
            res()
          }, 500)
        })
      }
      // Could not find results
      if (!currentTabResults.has(tab.id)) return
      if (currentTabResults.get(tab.id).length === 0) return

      if (!!fillPreferences) {
        id = currentTabResults
          .get(tab.id)
          .findIndex(
            ({ host, id: objectId }) =>
              host === fillPreferences.host &&
              objectId === fillPreferences.objectId
          )
        if (id === -1) id = 0
      }
      let result = currentTabResults.get(tab.id)[id]
      for (const field of currentTabResults.get(tab.id)[id].fields) {
        // Decrypt if needed
        if (field.isEncrypted && !result.isDecrypted) {
          const currentSessions = await sessions.get()
          result = await vault.decryptObject(
            result.host,
            currentSessions.get(result.host).token,
            result
          )
        }
        values[field.name] = field.value
      }
      browser.tabs.sendMessage(tab.id, message)
    })
}

/**
 * Handle incoming messages.
 * @param message Message sent from other scripts.
 */
function onMessage (
  message: Message,
  sender: browser.runtime.MessageSender
): any {
  const { context, action, data } = message
  if (context === 'save' && action === 'init') {
    saveFlow(data, sender.tab?.id)
  } else if (context === 'fill' && action === 'init') {
    // TODO: fill flow
    // saveFlow(data, sender.tab?.id)
  } else if (context === 'fill' && action === 'auto') {
    // TODO: Auto fill
  } else if (
    context === 'iframe' ||
    (context === 'fill' && action === 'fill')
  ) {
    // Forward message
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      // Return in case data needs to come back to initiating script
      return browser.tabs.sendMessage(tab.id, message)
    })
  }
}

/**
 * Wrap a message callback with a port.
 * @param port Port that sent the message.
 */
function onPortMessage (port: browser.runtime.Port) {
  return (message: Message) => onMessage(message, port.sender)
}

function onConnect (port: browser.runtime.Port) {
  if (port.name === 'search') {
    console.log('SEARCH')
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => {
        port.postMessage({
          context: 'autosearch',
          action: 'populate',
          data: currentTabResults.get(tab.id) ?? []
        })
      })
      .catch(console.error)
  }

  const messageCallback = onPortMessage(port)
  port.onMessage.addListener(messageCallback)

  function onDisconnect () {
    console.log('DISCONNECTED %o', port)
    port.onMessage.removeListener(messageCallback)
    port.onDisconnect.removeListener(onDisconnect)
  }
  port.onMessage.addListener(messageCallback)
  port.onDisconnect.addListener(onDisconnect)
}

let currentTabResults: Map<number, StoredSafeObject[]> = new Map()
function onTabResultsChanged (tabResults: Map<number, StoredSafeObject[]>) {
  currentTabResults = tabResults
  for (const [tabId, results] of tabResults) {
    if (results.length > 0) {
      browser.browserAction.setBadgeText({
        tabId,
        text: results.length.toString()
      })
    }
  }
}

// Set up tasks that depend on timers and changes in storage.
const untrackIdleInterval = idleInterval()
const untrackKeepAlive = keepAlive()
const untrackOnlineStatus = onlineStatus(setIcon)
const untrackHardTimeout = hardTimeout()
const untrackAutoSearch = autoSearch(onTabResultsChanged)

browser.idle.onStateChanged.addListener(onIdle)
browser.alarms.onAlarm.addListener(onAlarm)
browser.runtime.onMessage.addListener(onMessage)
browser.runtime.onConnect.addListener(onConnect)
