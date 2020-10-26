import { getMessage, LocalizedMessage } from '../global/i18n'
import { sessions } from '../global/storage'
import { auth } from '../global/api'
import { hardTimeout, idleInterval, keepAlive, onlineStatus } from './tasks'
import {
  ALARM_HARD_TIMEOUT,
  ALARM_KEEP_ALIVE,
  splitAlarmName
} from './constants'
import type { Message } from '../global/messages'
import { saveFlow } from './flows/saveFlow'

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

/**
 * Handle incoming messages.
 * @param message Message sent from other scripts.
 */
function onMessage (message: Message, sender: browser.runtime.MessageSender) {
  console.log('INCOMING MESSAGE %o', message)
  if (message.context === 'save' && message.action === 'init') {
    saveFlow(message.data, sender.tab?.id)
  } else if (message.context === 'fill' && message.action === 'init') {
    // TODO: fill flow
    // saveFlow(message.data, sender.tab?.id)
  } else if (message.context === 'iframe') {
    // Forward message
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      browser.tabs.sendMessage(tab.id, message)
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
  const messageCallback = onPortMessage(port)
  port.onMessage.addListener(messageCallback)

  function onDisconnect () {
    port.onMessage.removeListener(messageCallback)
    port.onDisconnect.removeListener(onDisconnect)
  }
  port.onMessage.addListener(messageCallback)
  port.onDisconnect.addListener(onDisconnect)
}

// Set up tasks that depend on timers and changes in storage.
const untrackIdleInterval = idleInterval()
const untrackKeepAlive = keepAlive()
const untrackOnlineStatus = onlineStatus(setIcon)
const untrackHardTimeout = hardTimeout()

browser.idle.onStateChanged.addListener(onIdle)
browser.alarms.onAlarm.addListener(onAlarm)
browser.runtime.onMessage.addListener(onMessage)
browser.runtime.onConnect.addListener(onConnect)
