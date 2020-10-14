import { sessions } from '../../global/storage'
import { ALARM_KEEP_ALIVE, genAlarmName } from '../constants'

/**
 * Keep sessions alive by performing a check request at intervals relative to
 * the session timeout.
 * Will perform an initial check request on all sessions on setup to ensure
 * the time until the next timeout is known.
 * @returns Cleanup function to stop all intervals.
 */
export function keepAlive (): () => void {
  let alarms: Map<string, string> = new Map()

  function onSessionsChanged (sessions: Map<string, Session>) {
    // Clear obsolete alarms
    for (const [host, name] of alarms) {
      if (!sessions.has(host)) {
        console.debug(`Removing keepalive for ${host}`)
        browser.alarms.clear(name)
        alarms.delete(host)
      }
    }
    // Set up new alarms
    for (const [host, session] of sessions) {
      if (!alarms.has(host)) {
        console.debug(`Setting up keepalive for ${host}`)
        // Set timeout to 75% of server timeout to leave some margin
        const timeout = (session.timeout * 0.75) / 6e4
        const name = genAlarmName(ALARM_KEEP_ALIVE, host, session.token)
        // Set up alarm
        browser.alarms.create(name, { when: Date.now(), periodInMinutes: timeout })
        alarms.set(host, name)
      }
    }
  }

  // Set up listener for changes to sessions
  sessions
    .subscribe(onSessionsChanged)
    .then(sessions => {
      // Perform initial setup
      onSessionsChanged(sessions)
    })
    .catch(console.error)

  // Cleanup
  return function stop () {
    sessions.unsubscribe(onSessionsChanged)
    for (const name of alarms.values()) {
      browser.alarms.clear(name)
    }
  }
}
