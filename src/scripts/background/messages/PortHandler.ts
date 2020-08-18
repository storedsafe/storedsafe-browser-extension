import Logger from '../../../utils/Logger'
import { logger as messageLogger } from '.'
import StoredSafeError from '../../../utils/StoredSafeError'
import { FLOW_SAVE, FLOW_FILL, ACTION_SUBMIT } from '../../content_script/messages'

class StoredSafePortHandlerError extends StoredSafeError {}

export class PortHandler {
  private static logger = new Logger(PortHandler.name, messageLogger)
  private static handlers: PortHandler[] = []

  static StartTracking () {
    browser.runtime.onConnect.addListener(PortHandler.onConnect)
  }

  static StopTracking () {
    browser.runtime.onConnect.removeListener(PortHandler.onConnect)
  }

  private static onConnect(port: browser.runtime.Port) {
    const handler = new PortHandler(port)
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

  private startListening(): void {
    if (this.port === null) {
      throw new StoredSafePortHandlerError('Port is null, cannot start listening.')
    }
    this.port.onMessage.addListener(this.onMessage)
    this.port.onDisconnect.addListener(this.onDisconnect)
  }

  private stopListening(): void {
    if (this.port === null) {
      throw new StoredSafePortHandlerError('Port is null, cannot stop listening.')
    }
    this.port.onMessage.removeListener(this.onMessage)
    this.port.onDisconnect.removeListener(this.onDisconnect)
    this.port = null
  }

  private disconnect(): void {
    this.port.disconnect()
  }

  private onDisconnect(): void {
    this.stopListening()
  }

  private onMessage({ type, data }: Message) {
    const [flow, action] = type.split('.')
    switch(flow) {
      case FLOW_SAVE: {
        this.onSaveFlow({ type: action, data })
        break
      }
      case FLOW_FILL: {
        this.onFillFlow({ type: action, data })
        break
      }
    }
  }

  private onSaveFlow({ type, data }: Message) {
    switch (type) {
      case ACTION_SUBMIT: {

        break
      }
    }
  }

  private onFillFlow({ type, data }: Message) {
    switch (type) {

    }
  }
}
