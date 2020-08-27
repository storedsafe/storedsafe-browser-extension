import Logger from '../../../utils/Logger'
import { logger as messageLogger } from '.'
import StoredSafeError from '../../../utils/StoredSafeError'
import {
  FLOW_SAVE,
  FLOW_FILL,
  ACTION_INIT
} from '../../content_script/messages/constants'
import { createSaveFlow } from './saveFlow'
import { checkOnlineStatus } from '../sessions/sessionTools'

class StoredSafePortHandlerError extends StoredSafeError {}
const logger = new Logger('Ports', messageLogger)

export class PortHandler {
  private static handlers: Map<browser.runtime.Port, PortHandler> = new Map()

  static StartTracking () {
    browser.runtime.onConnect.addListener(PortHandler.onConnect)
  }

  static StopTracking () {
    browser.runtime.onConnect.removeListener(PortHandler.onConnect)
  }

  private static onConnect (port: browser.runtime.Port) {
    if (port.sender?.tab?.id === undefined) {
      logger.debug('Connected to %s', port.name)
    } else {
      logger.debug('Connected to %s on tab [%d]', port.name, port.sender.tab.id)
    }
    const handler = new PortHandler(port)
    handler.startListening()
    PortHandler.handlers.set(port, handler)
  }

  private port: browser.runtime.Port = null

  private constructor (port: browser.runtime.Port) {
    // Make sure JS remembers what `this` is
    this.startListening = this.startListening.bind(this)
    this.stopListening = this.stopListening.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this.onDisconnect = this.onDisconnect.bind(this)
    this.onMessage = this.onMessage.bind(this)

    this.port = port
  }

  private startListening (): void {
    if (this.port === null) {
      throw new StoredSafePortHandlerError(
        'Port is null, cannot start listening.'
      )
    }
    this.port.onMessage.addListener(this.onMessage)
    this.port.onDisconnect.addListener(this.onDisconnect)
  }

  private stopListening (): void {
    if (this.port === null) {
      throw new StoredSafePortHandlerError(
        'Port is null, cannot stop listening.'
      )
    }
    this.port.onMessage.removeListener(this.onMessage)
    this.port.onDisconnect.removeListener(this.onDisconnect)
    PortHandler.handlers.delete(this.port)
    this.port = null
  }

  private disconnect (): void {
    this.port.disconnect()
  }

  private onDisconnect (): void {
    if (this.port.sender?.tab?.id === undefined) {
      logger.debug('Disconnected from %s', this.port.name)
    } else {
      logger.debug(
        'Disconnected from %s on tab [%d]',
        this.port.name,
        this.port.sender.tab.id
      )
    }
    this.stopListening()
  }

  private onMessage ({ type, data }: Message) {
    logger.debug('Incoming message %s', type)
    const [flow, action] = type.split('.')
    switch (flow) {
      case FLOW_SAVE: {
        if (action === ACTION_INIT) {
          createSaveFlow(this.port, data)
        }
        break
      }
      case FLOW_FILL: {
        if (action === ACTION_INIT) {
          // TODO: createFillFlow(this.port, data)
        }
        break
      }
      default: {
        throw new StoredSafePortHandlerError(
          `Unknown message flow: ${flow}.${action}`
        )
      }
    }
  }
}
