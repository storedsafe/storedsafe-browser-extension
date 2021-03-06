import { Logger } from '../../global/logger'
import { sessions } from '../../global/storage'

const logger = new Logger('onlinestatus')

/**
 * Track online status.
 * Set to online if there is at least one active session.
 * @param cb Callback with new online state when changed.
 * @returns Cleanup function to stop subscriptions.
 */
export function onlineStatus(cb: (online: boolean) => void): () => void {
  let wasOnline = false

  /**
   * Update online status when sessions change.
   * @param sessions New sessions object.
   */
  function onSessionsChanged(sessions: Map<string, Session>): void {
    const isOnline = sessions.size > 0
    if (wasOnline !== isOnline) {
      cb(isOnline)
      wasOnline = isOnline
      logger.info(`Online status changed to ${isOnline}`)
    }
  }

  // Set up listener for changes to settings
  sessions
    .subscribe(onSessionsChanged)
    .then(sessions => {
      // Set initial detection interval
      onSessionsChanged(sessions)
    })
    .catch(logger.error)

  // Cleanup
  return function stop() {
    sessions.unsubscribe(onSessionsChanged)
  }
}
