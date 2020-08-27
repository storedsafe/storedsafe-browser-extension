import Logger from '../../../utils/Logger'
import { logger as injectLogger } from '.'
import StoredSafeError from '../../../utils/StoredSafeError'

const logger = new Logger('Frames', injectLogger)

const ROOT_ID: string = 'com-storedsafe-root'
const BASE_STYLE: Record<string, string> = {
  border: '0',
  padding: '0',
  margin: '0',
  position: 'fixed',
  top: '10px',
  right: '10px',
  width: '100px',
  height: '100px',
  background: 'transparent',
  'z-index': '2147483646'
}

class StoredSafeFrameManagerError extends StoredSafeError {}

export class FrameManager {
  static OpenFrame (frameId: string, style?: Record<string, string>) {
    const root = FrameManager.getFrame(ROOT_ID, document.body, ROOT_ID, {
      'z-index': '2147483646'
    })
    FrameManager.getFrame(frameId, root, 'iframe', { ...BASE_STYLE, ...style })
  }

  static CloseFrame (frameId: string) {
    FrameManager.removeFrame(frameId)
    const root = document.getElementById(ROOT_ID)
    if (root.childElementCount === 0) {
      logger.log('Root frame is empty, removing %o.', root)
      root.remove()
    }
  }

  static ResizeFrame (frameId: string, width: number, height: number) {
    const frame = document.getElementById(frameId)
    if (frame === null) {
      throw new StoredSafeFrameManagerError(`Can't resize frame, #${frameId} doesn't exist.`)
    }
    frame.style.width = `${width}px`
    frame.style.height = `${height}px`
  }

  /**
   * Get the element with the matching ID or create it if it doesn't exist.
   * @param frameId ID attribute of the frame.
   */
  private static getFrame (
    frameId: string,
    parent: Node,
    frameType: string,
    style: Record<string, string> = {}
  ): HTMLElement {
    let frame = document.getElementById(frameId)
    if (frame === null) {
      frame = document.createElement(frameType)
      frame.id = frameId
      for (const prop in style) {
        frame.style.setProperty(prop, style[prop])
      }
      if (frame instanceof HTMLIFrameElement) {
        frame.src = browser.runtime.getURL('index.html') + `#${frameId}`
      }
      parent.appendChild(frame)
      logger.log('Creating frame %o', frame)
    }
    return frame
  }

  /**
   * Remove the element with the matching ID. Noop if element doesn't exist.
   * @param frameId ID attribute of the frame to be removed.
   */
  private static removeFrame (frameId: string = ROOT_ID): void {
    const frame = document.getElementById(frameId)
    if (frame !== null) {
      logger.log('Removing frame %o', frame)
      frame.remove()
    }
  }
}
