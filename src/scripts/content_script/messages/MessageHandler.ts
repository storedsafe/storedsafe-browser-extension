import Logger from '../../../utils/Logger'
import StoredSafeError from '../../../utils/StoredSafeError'
import { MODULE_NAME, FLOW_SAVE, FLOW_FILL, ACTION_OPEN, SAVE_FRAME_ID, FILL_FRAME_ID, ACTION_CLOSE, ACTION_RESIZE } from '.'
import { FrameManager } from '../inject/FrameManager'

class StoredSafeMessageHandlerError extends StoredSafeError {}

export class MessageHandler {
  private static logger = new Logger(MODULE_NAME + MessageHandler.name)
  private static handler: MessageHandler = null

  private port: browser.runtime.Port

  static StartTracking () {
    if (MessageHandler.handler === null) {
      MessageHandler.handler = new MessageHandler()
    }
    MessageHandler.handler.start()
  }

  static StopTracking () {
    if (MessageHandler.handler === null) {
      throw new StoredSafeMessageHandlerError('No handler available to stop.')
    }
    MessageHandler.handler.stop()
  }

  private constructor () {
    // Make sure JS remembers what `this` is
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.onMessage = this.onMessage.bind(this)
  }

  private start (): void {
    this.port = browser.runtime.connect(browser.runtime.id, {
      name: 'content_script'
    })
  }

  private stop (): void {
    this.port.disconnect()
  }

  private onMessage ({ type, data }: Message): void {
    const [flow, action] = type.split('.')
    if (flow === undefined || action === undefined) {
      throw new StoredSafeMessageHandlerError(
        `Invalid message: ${{ type, data }}, message.type must be of type 'flow.action'.`
      )
    }
    let frameId: string = null
    if (flow === FLOW_SAVE) frameId = SAVE_FRAME_ID
    if (flow === FLOW_FILL) frameId = FILL_FRAME_ID
    if (frameId !== null) {
      switch (flow) {
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
        }
        default: {
          throw new StoredSafeMessageHandlerError(
            `Unknown message flow: ${flow}.${action}`
          )
        }
      }
    }
  }
}
