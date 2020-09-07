import Logger from '../../../utils/Logger'
import { logger as messageLogger } from '.'
import StoredSafeError from '../../../utils/StoredSafeError'
import {
  FLOW_SAVE,
  FLOW_FILL,
  ACTION_INIT,
  PORT_CONTENT
} from '../../content_script/messages/constants'
import { SaveFlow } from './SaveFlow'
import { FillFlow } from './FillFlow'

class StoredSafePortHandlerError extends StoredSafeError {}
const logger = new Logger('Ports', messageLogger)

export class PortHandler {
  private static tabHandlers = new Map<number, PortHandler>()
  static StartTracking () {
    browser.runtime.onConnect.addListener(PortHandler.onConnect)
  }

  static StopTracking () {
    browser.runtime.onConnect.removeListener(PortHandler.onConnect)
  }

  static SendFill (data: SSObject[]): void {
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab === undefined) return
      const contentPortHandler = PortHandler.tabHandlers.get(tab.id)
      FillFlow.Create(contentPortHandler.port, data)
    })
  }

  private static onConnect (port: browser.runtime.Port) {
    if (port.sender?.tab?.id === undefined) {
      logger.debug('Connected to %s', port.name)
    } else {
      logger.debug('Connected to %s on tab [%d]', port.name, port.sender.tab.id)
    }
    const handler = new PortHandler(port)
    handler.startListening()
    if (port.name === PORT_CONTENT) {
      PortHandler.tabHandlers.set(port.sender.tab.id, handler)
    }
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
    if (this.port.name === PORT_CONTENT) {
      PortHandler.tabHandlers.delete(this.port.sender.tab.id)
    }
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
          SaveFlow.Create(this.port, data)
        }
        break
      }
      case FLOW_FILL: {
        if (action === ACTION_INIT) {
          function createFillFlow(contentPort: browser.runtime.Port) {
            FillFlow.Create(contentPort, data)
          }
          if (this.port.name !== PORT_CONTENT) {
            browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
              const contentPortHandler = PortHandler.tabHandlers.get(tab.id)
              createFillFlow(contentPortHandler.port)
            })
          } else {
            createFillFlow(this.port)
          }
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
