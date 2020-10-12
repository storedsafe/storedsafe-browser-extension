import { getMessage, LocalizedMessage } from '../global/i18n'
import { sessions } from '../global/storage'
import { auth } from '../global/api'
import { hardTimeout, idle, keepAlive, onlineStatus } from './tasks'

console.log('BACKGROUND - %s', getMessage(LocalizedMessage.EXTENSION_NAME))

/**
 * Invalidate all sessions.
 */
function logoutAll(): void {
  sessions.get().then(sessions => {
    for (const [host, session] of sessions) {
      auth.logout(host, session.token).catch(console.error)
    }
  }).catch(console.error)
}

/**
 * Set the browser action icon to reflect the online status.
 * @param isOnline `true` if at least one active session exists.
 */
function setIcon(isOnline: boolean): void {
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
function onIdle(state: browser.idle.IdleState): void {
  if (state === 'idle') {
    logoutAll()
  }
}

const untrackIdle = idle(onIdle)
const untrackKeepAlive = keepAlive()
const untrackOnlineStatus = onlineStatus(setIcon)
const untrackHardTimeout = hardTimeout()