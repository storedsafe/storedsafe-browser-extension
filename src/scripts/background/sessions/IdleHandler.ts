import Logger from '../../../utils/Logger'
import StoredSafeError from '../../../utils/StoredSafeError'
import { logger as sessionsLogger } from '.'
import { invalidateAllSessions, subscribeToSettingsField } from './sessionTools'

const logger = new Logger('Idle', sessionsLogger)
class StoredSafeIdleError extends StoredSafeError {}

/**
 * Handles changes in idle state so that sessions can be invalidated
 * after a user is set as idle. The time to trigger the idle state is
 * based on the user settings for the extension.
 */
export class IdleHandler {
  constructor () {
    // Make sure JS remembers what `this` is
    this.onIdleMaxChanged = this.onIdleMaxChanged.bind(this)
    this.setDetectionInterval = this.setDetectionInterval.bind(this)
    this.onIdleChange = this.onIdleChange.bind(this)

    subscribeToSettingsField('idleMax', this.onIdleMaxChanged, error => {
      logger.error(
        'Error while setting up idle handler, could not fetch settings. %o',
        error
      )
    })
  }

  /**
   * Get idle interval from the updated user settings and adjust the idle detection interval.
   * @param settings Updated settings object.
   */
  private onIdleMaxChanged (idleMax: number): void {
    // Convert timeout duration from minutes to milliseconds
    const intervalInSeconds = idleMax * 60
    this.setDetectionInterval(intervalInSeconds)
  }

  /**
   * Set the time in seconds of inactivity required for the browser to be considered to be in an
   * idle state.
   * @param intervalInSeconds Seconds of inactivity until idle.
   */
  private setDetectionInterval (intervalInSeconds: number): void {
    intervalInSeconds = Math.floor(intervalInSeconds)
    intervalInSeconds = Math.max(15, intervalInSeconds)
    logger.log(
      'Setting idle detection interval to %ds (%dm).',
      intervalInSeconds,
      intervalInSeconds / 60
    )
    browser.idle.setDetectionInterval(intervalInSeconds)
  }

  /**
   * Handle changes in the idle state.
   * @param state New idle state.
   */
  onIdleChange (state: 'idle' | 'locked' | 'active'): void {
    if (state === 'idle') {
      logger.log('Idle state triggered, invalidate all sessions.')
      invalidateAllSessions()
    }
  }
}
