import { getMessage, LocalizedMessage } from '../global/i18n'
import { sessions } from '../global/storage'
import { auth } from '../global/api'
import { idle, keepAlive } from './tasks'

console.log('BACKGROUND - %s', getMessage(LocalizedMessage.EXTENSION_NAME))

function logoutAll(): void {
  sessions.get().then(sessions => {
    for (const [host, session] of sessions) {
      auth.logout(host, session.token).catch(console.error)
    }
  }).catch(console.error)
}

const untrackIdle = idle(logoutAll)
const untrackKeepAlive = keepAlive()