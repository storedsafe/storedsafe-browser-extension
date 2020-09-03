import StoredSafeError from '../../../utils/StoredSafeError'
import Logger from '../../../utils/Logger'
import { logger as messageLogger } from '.'
import {
  FLOW_SAVE,
  ACTION_OPEN,
  PORT_CONTENT,
  ACTION_CLOSE,
  ACTION_RESIZE,
  ACTION_POPULATE,
  PORT_SAVE_CONNECTED,
  PORT_SAVE_CLOSE,
  PORT_SAVE_RESIZE,
  PORT_SAVE_PREFIX
} from '../../content_script/messages/constants'
import { saveURLToField, shouldSave } from './messageTools'
import { logger } from '../sessions'

const flowLogger = new Logger('Save', messageLogger)

// Stop trying to open save prompt after `SAVE_RETRIES` attempts
const SAVE_RETRIES = 3
// Stop trying to open save prompt after `SAVE_TIMEOUT` ms
const SAVE_TIMEOUT = 10e3
// Don't count retry if it has been less than `SAVE_RETRY_TIME` ms has passed since the last attempt.
const SAVE_RETRY_TIME = 1e3

class StoredSafeSaveFlowError extends StoredSafeError {}

/**
 * Initiate a save flow where the user is prompted to save data from
 * a submitted form. This function will only handle the passing of messages
 * to and from the involved scripts and not the actual saving of data.
 *
 * The content script which initiated the flow will handle frame-related actions
 * whereas the script that runs inside the injected frame will handle the actual
 * UI prompt and functions for saving the data in StoredSafe.
 *
 * As a measure against redirects and hasty user navigation, the save prompt
 * will keep appearing until `SAVE_RETRIES` number of attempts have been performed.
 * In addition to the retries, if more than `SAVE_TIMEOUT` ms passes since the flow
 * was started, it is assumed the user has seen the prompt and decided not to
 * interact with it. Therefore it will not appear again on the next connection
 * after the timeout has been reached.
 * @param initPort Port where the init action came from.
 * @param data Form data to be saved.
 */
export class SaveFlow {
  private static flows: Map<number, SaveFlow> = new Map()

  private initPort: browser.runtime.Port
  private contentPort: browser.runtime.Port = null
  private data: [string, string][]

  private promptCount = 0
  private hasTimedOut = false
  private timeoutId: number = null
  private lastTry: number = 0

  private logger: Logger

  /**
   * Create a new save flow for the active tab. Will cancel any previous flow
   * on that same tab if it exists.
   *
   * The save flow will stop short if the user is not logged in, if the url
   * of the active tab is in the ignore list or if there is a cached search
   * result with the same url and username as the submitted data.
   *
   * @param initPort Port which initiated the save flow.
   * @param data Form data associated with the current flow.
   */
  static Create (
    initPort: browser.runtime.Port,
    data: [string, string][]
  ): void {
    if (initPort.sender?.tab?.id === undefined)
      throw new StoredSafeSaveFlowError('Sender has no tab ID.')
    const tab = initPort.sender.tab
    const flow = SaveFlow.flows.get(tab.id)
    if (flow !== undefined) {
      flow.cancel()
    }

    shouldSave(tab, data)
      .then(save => {
        if (save) SaveFlow.flows.set(tab.id, new SaveFlow(initPort, data))
      })
      .catch(() => {
        throw new StoredSafeSaveFlowError(
          'Failed to check whether the save flow should be started.'
        )
      })
  }

  /**
   * Start a new save flow.
   * @param initPort Port which initiated the save flow.
   * @param data Submitted form data.
   */
  private constructor (
    initPort: browser.runtime.Port,
    data: [string, string][]
  ) {
    this.onContentConnect = this.onContentConnect.bind(this)
    this.onContentDisconnect = this.onContentDisconnect.bind(this)
    this.onIframeConnect = this.onIframeConnect.bind(this)
    this.onIframeDisconnect = this.onIframeDisconnect.bind(this)
    this.onIframeMessage = this.onIframeMessage.bind(this)
    this.onConnect = this.onConnect.bind(this)
    this.cancel = this.cancel.bind(this)

    this.initPort = initPort
    this.data = data

    this.logger = new Logger(
      `(${initPort.sender.tab.url}) [${initPort.sender.tab.id}]`,
      flowLogger
    )

    this.onContentConnect(this.initPort)
    this.timeoutId = window.setTimeout(() => {
      logger.debug('Flow timed out')
      this.hasTimedOut = true
    }, SAVE_TIMEOUT)
    browser.runtime.onConnect.addListener(this.onConnect)
  }

  /**
   * When the content_script connects, the save prompt should be opened if the
   * `SAVE_RETRIES` threshold has not been exceeded.
   * @param port Connecting content_script port.
   */
  private onContentConnect (port: browser.runtime.Port): void {
    this.logger.debug('Connected to content port')
    port.onDisconnect.addListener(this.onContentDisconnect)
    this.contentPort = port

    if (this.promptCount < SAVE_RETRIES && this.hasTimedOut === false) {
      if (Date.now() - this.lastTry > SAVE_RETRY_TIME) this.promptCount++
      this.lastTry = Date.now()
      this.contentPort.postMessage({
        type: `${FLOW_SAVE}.${ACTION_OPEN}`
      })
    } else {
      this.cancel()
    }
  }

  /**
   * Tear-down procedure for when iframe disconnects (reload).
   */
  private onContentDisconnect (port: browser.runtime.Port): void {
    port.onDisconnect.removeListener(this.onContentDisconnect)
    this.contentPort = null
  }

  /**
   * When the iframe connects, it is ready to recieve the flow data.
   */
  private onIframeConnect (port: browser.runtime.Port): void {
    this.logger.debug('Connected to iframe port')

    if (port.name === PORT_SAVE_CONNECTED) {
      const values: SaveValues = {
        url: saveURLToField(this.initPort.sender?.url),
        name: this.initPort.sender?.tab?.title
      }
      for (const [key, value] of this.data) {
        values[key] = value
      }
      port.postMessage({
        type: `${FLOW_SAVE}.${ACTION_POPULATE}`,
        data: values
      })
    } else if (
      port.name === PORT_SAVE_CLOSE ||
      port.name === PORT_SAVE_RESIZE
    ) {
      port.onDisconnect.addListener(this.onIframeDisconnect)
      port.onMessage.addListener(this.onIframeMessage)
    }
  }

  /**
   * Tear-down procedure for when iframe disconnects (on close frame / reload).
   */
  private onIframeDisconnect (port: browser.runtime.Port): void {
    port.onDisconnect.removeListener(this.onIframeDisconnect)
    port.onMessage.removeListener(this.onIframeMessage)
  }

  /**
   * Receive messages from iframe port to change the state of the iframe,
   * which can only be done from outside the frame.
   * @param message Message from iframe.
   */
  private onIframeMessage (message: Message): void {
    const [flow, action] = message.type.split('.')
    if (flow !== FLOW_SAVE) {
      return // Other flow from same tab
    }
    if (action === ACTION_CLOSE) {
      this.cancel()
    } else if (action === ACTION_RESIZE) {
      this.contentPort.postMessage(message) // Forward message to content_script
    } else {
      throw new StoredSafeSaveFlowError(`Unknown message ${flow}.${action}`)
    }
  }

  /**
   * Handle incoming connections from other scripts.
   * Will only handle incoming connections from the same tab that started the flow.
   * @param port Connecting port.
   */
  private onConnect (port: browser.runtime.Port): void {
    if (port.sender?.tab?.id === this.initPort.sender?.tab?.id) {
      if (port.name === PORT_CONTENT) {
        this.onContentConnect(port)
      } else if (port.name.match(PORT_SAVE_PREFIX) !== null) {
        this.onIframeConnect(port)
      }
    }
  }

  /**
   * Cancel save flow and discard SaveFlow object.
   */
  private cancel (): void {
    browser.runtime.onConnect.removeListener(this.onConnect)
    window.clearTimeout(this.timeoutId)
    if (this.contentPort !== null) {
      this.contentPort.postMessage({
        type: `${FLOW_SAVE}.${ACTION_CLOSE}`
      })
    }
    SaveFlow.flows.delete(this.initPort.sender.tab.id)
  }
}
