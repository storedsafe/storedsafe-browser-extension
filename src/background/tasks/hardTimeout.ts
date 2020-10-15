import { settings, sessions } from '../../global/storage'
import { ALARM_HARD_TIMEOUT, genAlarmName } from '../constants'

/**
 * Keep timers for hard timeout on sessions.
 * @returns Cleanup function to stop subscriptions.
 */
export function hardTimeout (): () => void {
  const alarms: Map<string, { name: string; session: Session }> = new Map()
  let maxTokenLife: number = null

  /**
   * Calculate the time in ms before the session should time out.
   * @param createdAt Timestamp when the session was created.
   * @param maxTokenLife Max number of hours the token is allowed to stay alive.
   */
  function getWhen (createdAt: number): number {
    const maxTokenLifeMs = maxTokenLife * 36e5
    const when = createdAt + maxTokenLifeMs
    const now = Date.now()
    return when < now ? now : when
  }

  /**
   * Set hard timeout for session if `maxTokenLife` is greater than 0.
   * @param host StoredSafe host associated with `session`.
   * @param session StoredSafe session associated with `host`.
   */
  function setAlarm (host: string, session: Session) {
    if (maxTokenLife > 0) {
      const when = getWhen(session.createdAt)
      const diff = when - Date.now()
      console.debug(
        `Hard timeout for ${host} in ${diff}ms (<${Math.ceil(diff / 6e4)}m)`
      )
      const name = genAlarmName(ALARM_HARD_TIMEOUT, host, session.token)
      browser.alarms.create(name, { when })
      alarms.set(host, { name, session })
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
      for (const [host, { name, session }] of alarms) {
        browser.alarms.clear(name)
        setAlarm(host, session)
      }
    }
  }

  /**
   * Update the detection interval if the settings change.
   * @param settings New settings object.
   */
  function onSessionsChanged (sessions: Map<string, Session>): void {
    // Clear obsolete timers
    for (const [host, { name }] of alarms) {
      if (!sessions.has(host)) {
        browser.alarms.clear(name)
        alarms.delete(host)
      }
    }

    // Set up timers for new sessions
    for (const [host, session] of sessions) {
      if (!alarms.has(host)) {
        setAlarm(host, session)
      }
    }
  }

  // Set up listener for changes to settings
  settings
    .subscribe(onSettingsChanged)
    .then(settings => {
      console.log('SETTINGS CHANGED %o', settings)
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
