import Logger from '../../../utils/Logger'
import StoredSafeError from '../../../utils/StoredSafeError'

import { MODULE_NAME } from '.'
import { checkSessionToken, subscribeToSessions, unsubscribeFromSessions } from './sessionTools'

const logger = new Logger(MODULE_NAME + ' - KeepAliveHandler')
class StoredSafeKeepAliveError extends StoredSafeError {}

/**
 * Handles keeping StoredSafe sessions alive to circumvent the server timeout
 * in favor of the idle state / max lifetime timeouts generated by the extension.
 *
 * The reason for implementing this workaround is in part the difference in workflow
 * between the extension and the web interface, but also the added capabilities of
 * user monitoring in the browser extension. Basically it's easier to track whether
 * a user is active and it's more convenient for the user to stay logged in for a
 * longer time while they're using their computer for other things.
 */
export class KeepAliveHandler {
  static handlers: Map<string, KeepAliveHandler> = new Map()

  /**
   * Set up/remove keep alive from active hosts when the list
   * of active sessions changes.
   * @param sessions Updated list of active sessions.
   */
  private static updateKeepaliveHandlers (sessions: Sessions) {
    for (const [host, keepAliveHandler] of KeepAliveHandler.handlers) {
      if (!sessions.has(host)) {
        keepAliveHandler.stop()
        KeepAliveHandler.handlers.delete(host)
      }
    }

    for (const [host, session] of sessions) {
      if (!KeepAliveHandler.handlers.has(host)) {
        KeepAliveHandler.handlers.set(
          host,
          new KeepAliveHandler(host, session.timeout)
        )
      }
    }
  }

  static StartTracking () {
    // Initialize keep alive objects
    subscribeToSessions(KeepAliveHandler.updateKeepaliveHandlers)
  }

  static StopTracking() {
    unsubscribeFromSessions(KeepAliveHandler.updateKeepaliveHandlers)
  }

  private intervalId: number = null
  private host: string
  private timeout: number

  private constructor (host: string, timeout: number) {
    // Make sure JS remembers what `this` is
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)

    this.host = host
    this.timeout = timeout * 0.75 // Leave a little margin

    // Perform initial check to ensure time until next check is within the timeout.
    this.keepAlive()

    // Start interval
    this.start()
  }

  /**
   * Perform check request to keep the token alive.
   */
  private keepAlive () {
    logger.log('Keep alive triggered for %s', this.host)
    checkSessionToken(this.host)
  }

  /**
   * Start interval for keeping token alive.
   */
  private start () {
    if (this.intervalId !== null) {
      throw new StoredSafeKeepAliveError(
        `can't start keep alive interval for '${this.host}', interval already exists.`
      )
    }
    logger.log('Scheduled keep alive for %s', this.host)
    this.intervalId = window.setInterval(this.keepAlive, this.timeout)
  }

  /**
   * Stop interval for keeping token alive.
   */
  private stop () {
    if (this.intervalId === null) {
      throw new StoredSafeKeepAliveError(
        `can't stop keep alive interval for '${this.host}', no interval exists.`
      )
    } else {
      clearInterval(this.intervalId)
      logger.log('Unregistered keep alive for %s', this.host)
    }
  }
}
