import { auth } from '../../global/api'
import { sessions } from '../../global/storage'

/**
 * Keep sessions alive by performing a check request at intervals relative to
 * the session timeout.
 * Will perform an initial check request on all sessions on setup to ensure
 * the time until the next timeout is known.
 * @returns Cleanup function to stop all intervals.
 */
export function keepAlive (): () => void {
  let timers: Map<string, number> = new Map()

  /**
   * Returns a closure around the host and token to create a callback to be
   * called on intervals.
   * @param host StoredSafe host.
   * @param token Token associated with session for `host`.
   */
  function keepAlive (host: string, token: string): () => void {
    return () => {
      console.debug(`Keepalive triggered for ${host}`)
      auth.check(host, token).catch(console.error)
    }
  }

  function onSessionsChanged (sessions: Map<string, Session>) {
    // Clear obsolete timers
    for (const [host, timer] of timers) {
      if (!sessions.has(host)) {
        console.debug(`Removing keepalive for ${host}`)
        window.clearInterval(timer)
        timers.delete(host)
      }
    }
    // Set up new timers
    for (const [host, session] of sessions) {
      if (!timers.has(host)) {
        console.debug(`Setting up keepalive for ${host}`)
        // Set timeout to 75% of server timeout to leave some margin
        const timeout = session.timeout * 0.75
        const cb = keepAlive(host, session.token)
        // Perform initial check to align timeout with server timeout
        cb()
        // Set up interval
        timers.set(
          host,
          window.setInterval(cb, timeout)
        )
      }
    }
  }

  // Set up listener for changes to sessions
  sessions.subscribe(onSessionsChanged).then(sessions => {
    // Perform initial setup
    onSessionsChanged(sessions)
  }).catch(console.error)

  // Cleanup
  return function stop () {
    sessions.unsubscribe(onSessionsChanged)
    for (const timer of timers.values()) {
      window.clearInterval(timer)
    }
  }
}
