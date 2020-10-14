import { getMessage, LocalizedMessage } from '../global/i18n'
import { sessions } from '../global/storage'
import { auth } from '../global/api'
import { hardTimeout, idleInterval, keepAlive, onlineStatus } from './tasks'
import {
  ALARM_HARD_TIMEOUT,
  ALARM_KEEP_ALIVE,
  splitAlarmName
} from './constants'

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

// Set up tasks that depend on changes in storage
const untrackIdleInterval = idleInterval()
const untrackKeepAlive = keepAlive()
const untrackOnlineStatus = onlineStatus(setIcon)
const untrackHardTimeout = hardTimeout()

browser.idle.onStateChanged.addListener(onIdle)
browser.alarms.onAlarm.addListener(onAlarm)
