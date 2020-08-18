import Logger from '../../../utils/Logger'
import StoredSafeError from '../../../utils/StoredSafeError'

import { logger as sessionsLogger } from '.'
import {
  subscribeToSessions,
  unsubscribeFromSessions,
  invalidateSession,
  subscribeToSettingsField,
  unsubscribeFromSettingsField
} from './sessionTools'

const logger = new Logger('Timeout', sessionsLogger)
class StoredSafeTimeoutError extends StoredSafeError {}

/**
 * Handles hard timeouts for tokens after the max token life from the user settings
 * is reached.
 *
 * This can be set either as a security measure, to prevent perpetual sessions, or to
 * force the user to log in more often, helping them remember their master password.
 */
export class TimeoutHandler {
  static handlers: Map<string, TimeoutHandler> = new Map()

  /**
   * Set up/remove session timeout handlers when the list of active sessions changes.
   * @param sessions Updated list of active sessions.
   */
  private static updateTimeoutHandlers (sessions: Sessions) {
    for (const [host, timeoutHandler] of TimeoutHandler.handlers) {
      if (!sessions.has(host)) {
        timeoutHandler.stop()
        TimeoutHandler.handlers.delete(host)
      }
    }

    for (const [host, session] of sessions) {
      if (!TimeoutHandler.handlers.has(host)) {
        TimeoutHandler.handlers.set(
          host,
          new TimeoutHandler(host, session.createdAt)
        )
      }
    }
  }

  /**
   * Start tracking sessions to set up timeout handlers for active sessions.
   */
  static StartTracking () {
    // Initialize keep alive objects
    subscribeToSessions(TimeoutHandler.updateTimeoutHandlers)
  }

  /**
   * Stop tracking sessions and cancel timeouts for active sessions.
   */
  static StopTracking () {
    unsubscribeFromSessions(TimeoutHandler.updateTimeoutHandlers)
    for (const handler of TimeoutHandler.handlers.values()) {
      handler.stop()
    }
    TimeoutHandler.handlers.clear()
  }

  private timeoutId: number = null
  private host: string
  private createdAt: number

  private constructor (host: string, createdAt: number) {
    // Make sure JS remembers what `this` is
    this.setSessionTimeout = this.setSessionTimeout.bind(this)
    this.clearSessionTimeout = this.clearSessionTimeout.bind(this)
    this.onTimeout = this.onTimeout.bind(this)
    this.onMaxTokenLifeChange = this.onMaxTokenLifeChange.bind(this)

    this.host = host
    this.createdAt = createdAt

    this.start()
  }

  /**
   * Start timeout and start tracking changes in settings.
   */
  start () {
    subscribeToSettingsField(
      'maxTokenLife',
      this.onMaxTokenLifeChange,
      error => {
        logger.error('Could not update session timeout. %o', error)
      }
    )
  }

  /**
   * Stop timeout and stop tracking changes in settings.
   */
  stop () {
    unsubscribeFromSettingsField(this.onMaxTokenLifeChange)
    this.clearSessionTimeout()
  }

  /**
   * Invalidate timed out session.
   */
  private onTimeout () {
    logger.log('Session for %s timed out.', this.host)
    invalidateSession(this.host)
  }

  /**
   * Start interval for keeping token alive.
   * @param timeout Milliseconds until session times out.
   */
  private setSessionTimeout (timeout: number) {
    if (this.timeoutId !== null) {
      this.clearSessionTimeout()
    }
    logger.log(
      'Scheduled session timeout for %s in %dms (%d minutes / %d hours)',
      this.host,
      timeout,
      timeout / 6e4,
      timeout / 36e5
    )
    this.timeoutId = window.setTimeout(this.onTimeout, timeout)
  }

  /**
   * Cancel session timeout.
   */
  private clearSessionTimeout () {
    if (this.timeoutId === null) {
      throw new StoredSafeTimeoutError(
        `can't cancel timeout for '${this.host}', no timeout exists.`
      )
    } else {
      window.clearTimeout(this.timeoutId)
      this.timeoutId = null
      logger.log('Removed session timeout for %s', this.host)
    }
  }

  /**
   * React to changes in the maxTokenLife value of the user settings and adjust timers
   * accordingly.
   * @param maxTokenLife The new max amount of hours a session is able to stay valid.
   */
  private onMaxTokenLifeChange (maxTokenLife: number) {
    if (maxTokenLife === 0) {
      if (this.timeoutId !== null) {
        this.clearSessionTimeout()
      }
      return
    }

    const tokenLife = Date.now() - this.createdAt
    const maxTokenLifeMs = maxTokenLife * 36e5 // hours to ms
    const timeout = maxTokenLifeMs - tokenLife
    this.setSessionTimeout(timeout)
  }
}
