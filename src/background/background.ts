import { getMessage, LocalizedMessage } from '../global/i18n'
import { sessions } from '../global/storage'
import { auth } from '../global/api'
import { idle, keepAlive, onlineStatus } from './tasks'

console.log('BACKGROUND - %s', getMessage(LocalizedMessage.EXTENSION_NAME))

function logoutAll(): void {
  sessions.get().then(sessions => {
    for (const [host, session] of sessions) {
      auth.logout(host, session.token).catch(console.error)
    }
  }).catch(console.error)
}

function setIcon(isOnline: boolean): void {
  const icon = isOnline ? 'icon' : 'icon-inactive'
  browser.browserAction.setIcon({
    path: {
      48: `assets/${icon}_48.png`,
      96: `assets/${icon}_96.png`
    }
  })
}

const untrackIdle = idle(logoutAll)
const untrackKeepAlive = keepAlive()
const untrackOnlineStatus = onlineStatus(setIcon)
