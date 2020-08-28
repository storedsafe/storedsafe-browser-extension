import StoredSafeError from '../../../utils/StoredSafeError'
import { logger } from '.'
import {
  FLOW_SAVE,
  FLOW_FILL,
  ACTION_OPEN,
  SAVE_FRAME_ID,
  FILL_FRAME_ID,
  ACTION_CLOSE,
  ACTION_RESIZE,
  ACTION_INIT,
  PORT_CONTENT,
  ACTION_FILL
} from './constants'
import { FrameManager } from '../inject/FrameManager'
import { InputType } from '../forms/constants'
import { PageScanner } from '../forms/PageScanner'

class StoredSafeMessageHandlerError extends StoredSafeError {}

export class MessageHandler {
  private port: browser.runtime.Port = null
  private pageScanner: PageScanner

  constructor (pageScanner: PageScanner) {
    // Make sure JS remembers what `this` is
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.onMessage = this.onMessage.bind(this)
    this.sendSubmit = this.sendSubmit.bind(this)
    this.onDisconnect = this.onDisconnect.bind(this)

    this.pageScanner = pageScanner

    this.start()
  }

  private onDisconnect () {
    logger.log('Disconnected, shutting down port.')
    this.port.onDisconnect.removeListener(this.onDisconnect)
    this.port.onMessage.removeListener(this.onMessage)
  }

  start (): void {
    this.port = browser.runtime.connect(browser.runtime.id, {
      name: PORT_CONTENT
    })
    this.port.onMessage.addListener(this.onMessage)
    this.port.onDisconnect.addListener(this.onDisconnect)
  }

  stop (): void {
    this.port.disconnect()
    this.port = null
  }

  private onMessage ({ type, data }: Message): void {
    logger.log('Incoming message %s', type)
    const [flow, action] = type.split('.')
    if (flow === undefined || action === undefined) {
      throw new StoredSafeMessageHandlerError(
        `Invalid message: ${{
          type,
          data
        }}, message.type must be of type 'flow.action'.`
      )
    }
    let frameId: string = null
    if (flow === FLOW_SAVE) frameId = SAVE_FRAME_ID
    if (flow === FLOW_FILL) frameId = FILL_FRAME_ID
    if (frameId !== null) {
      switch (action) {
        case ACTION_OPEN: {
          FrameManager.OpenFrame(frameId)
          break
        }
        case ACTION_CLOSE: {
          FrameManager.CloseFrame(frameId)
          break
        }
        case ACTION_RESIZE: {
          FrameManager.ResizeFrame(frameId, data.width, data.height)
          break
        }
        case ACTION_FILL: {
          this.pageScanner.fill(data)
          break
        }
        default: {
          throw new StoredSafeMessageHandlerError(
            `Unknown message flow: ${flow}.${action}`
          )
        }
      }
    }
  }

  private postMessage (message: Message) {
    if (this.port === null) {
      throw new StoredSafeMessageHandlerError(
        'Cannot send message, port is closed.'
      )
    }
    this.port.postMessage(message)
  }

  /**
   * Send a submit message to the background script to initiate the save flow.
   * @param values Values of input fields mapped to input type.
   */
  sendSubmit (values: [InputType, string][]) {
    this.postMessage({
      type: `${FLOW_SAVE}.${ACTION_INIT}`,
      data: values
    })
  }
}
