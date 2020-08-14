import Logger from '../../../utils/Logger'
import StoredSafeError from '../../../utils/StoredSafeError'

import { MODULE_NAME } from '.'
import { subscribeToSessions, unsubscribeFromSessions } from './sessionTools'

const ICON_ONLINE = 'ico/icon.png'
const ICON_OFFLINE = 'ico/icon-inactive.png'

const logger = new Logger(MODULE_NAME + ' - OnlineStatusHandler')
class StoredSafeOnlineStatusError extends StoredSafeError {}

/**
 * Handles changes in idle state so that sessions can be invalidated
 * after a user is set as idle. The time to trigger the idle state is
 * based on the user settings for the extension.
 */
export class OnlineStatusHandler {
  private static handler: OnlineStatusHandler = null

  // Reference to see if online status has actually changed
  private isOnline: boolean = null

  /**
   * Start tracking online status.
   */
  static StartTracking () {
    if (OnlineStatusHandler.handler === null) {
      OnlineStatusHandler.handler = new OnlineStatusHandler()
    }
    OnlineStatusHandler.handler.start()
  }

  /**
   * Stop tracking online status.
   */
  static StopTracking () {
    if (OnlineStatusHandler.handler === null) {
      logger.error('No handler available to stop.')
    }
    OnlineStatusHandler.handler.stop()
  }

  private constructor () {
    // Make sure JS remembers what `this` is
    this.onSessionsChanged = this.onSessionsChanged.bind(this)
    this.setOnlineStatus = this.setOnlineStatus.bind(this)
  }

  /**
   * Start tracking online status.
   */
  private start () {
    subscribeToSessions(this.onSessionsChanged)
  }

  /**
   * Stop tracking online status.
   */
  private stop () {
    unsubscribeFromSessions(this.onSessionsChanged)
  }

  /**
   * Set the online status, indicated by the icon used for the popup.
   * @param isOnline New online status, true if online.
   */
  private setOnlineStatus (isOnline: boolean): void {
    const path = isOnline ? ICON_ONLINE : ICON_OFFLINE
    browser.browserAction
      .setIcon({ path })
      .then(() => {
        logger.log(
          'Set online status to `%s`.',
          isOnline ? 'online' : 'offline'
        )
      })
      .catch(error => {
        logger.error('Failed to update online status icon. %o', error)
      })
  }

  /**
   * Update online status based on changes in the list of active sessions.
   * @param settings Updated settings object.
   */
  private onSessionsChanged (sessions: Sessions): void {
    const isOnline = sessions.size > 0
    if (isOnline !== this.isOnline) {
      this.setOnlineStatus(sessions.size > 0)
      this.isOnline = isOnline
    }
  }
}
