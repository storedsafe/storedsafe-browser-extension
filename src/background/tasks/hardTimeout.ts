import { auth } from '../../global/api'
import { settings, sessions } from '../../global/storage'

/**
 * Keep timers for hard timeout on sessions.
 * @returns Cleanup function to stop subscriptions.
 */
export function hardTimeout (): () => void {
  const timers: Map<
    string,
    { timer: number; cb: () => void; createdAt: number }
  > = new Map()
  let maxTokenLife: number = null

  /**
   * Create callback function to invalidate a StoredSafe session.
   */
  function onTimeout (host: string, token: string): () => void {
    return function () {
      auth.logout(host, token)
      console.debug(`Hard timeout, invalidating session for ${host}`)
    }
  }

  /**
   * Calculate the time in ms before the session should time out.
   * @param createdAt Timestamp when the session was created.
   * @param maxTokenLife Max number of hours the token is allowed to stay alive.
   */
  function getTimeout (createdAt: number): number {
    const tokenLife = Date.now() - createdAt
    const maxTokenLifeMs = maxTokenLife * 36e5
    return maxTokenLifeMs - tokenLife
  }

  /**
   * Set hard timeout for session if `maxTokenLife` is greater than 0.
   * @param host StoredSafe host associated with session.
   * @param cb Callback to invalidate session associated with `host`.
   * @param createdAt Timestamp when the session was created.
   */
  function setTimeout (host: string, cb: () => void, createdAt: number) {
    if (maxTokenLife > 0) {
      const timeout = getTimeout(createdAt)
      console.debug(`Hard timeout for ${host} in ${timeout}ms (${Math.floor(timeout / 6e4)}m)`)
      timers.set(host, {
        timer: window.setTimeout(cb, timeout),
        cb,
        createdAt
      })
    }
  }

  /**
   * Update the detection interval if the settings change.
   * @param settings New settings object.
   */
  function onSettingsChanged (settings: Map<string, Setting>): void {
    if (settings.has('maxTokenLife')) {
      maxTokenLife = (settings.get('maxTokenLife').value as number) ?? -1

      // Update existing timers
      for (const [host, { timer, cb, createdAt }] of timers) {
        window.clearTimeout(timer)
        setTimeout(host, cb, createdAt)
      }
    }
  }

  /**
   * Update the detection interval if the settings change.
   * @param settings New settings object.
   */
  function onSessionsChanged (sessions: Map<string, Session>): void {
    // Clear obsolete timers
    for (const [host, { timer }] of timers) {
      if (!sessions.has(host)) {
        window.clearTimeout(timer)
        timers.delete(host)
      }
    }

    // Set up timers for new sessions
    for (const [host, { token, createdAt }] of sessions) {
      if (!timers.has(host)) {
        const cb = onTimeout(host, token)
        setTimeout(host, cb, createdAt)
      }
    }
  }

  // Set up listener for changes to settings
  settings
    .subscribe(onSettingsChanged)
    .then(settings => {
      // Set initial detection interval
      onSettingsChanged(settings)

      // Set up listener for changes to sessions
      // Sessions callback depends on settings for `maxTokenLife`
      sessions
        .subscribe(onSessionsChanged)
        .then(sessions => {
          // Set initial detection interval
          onSessionsChanged(sessions)
        })
        .catch(console.error)
    })
    .catch(console.error)

  // Cleanup
  return function stop () {
    settings.unsubscribe(onSettingsChanged)
    sessions.unsubscribe(onSessionsChanged)
  }
}
