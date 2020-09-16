import StoredSafeError from '../../../utils/StoredSafeError'
import Logger from '../../../utils/Logger'
import { logger as messageLogger } from '.'
import {
  FLOW_FILL,
  ACTION_OPEN,
  ACTION_CLOSE,
  ACTION_RESIZE,
  ACTION_POPULATE,
  PORT_FILL_CONNECTED,
  PORT_FILL_CLOSE,
  PORT_FILL_RESIZE,
  PORT_FILL_PREFIX,
  ACTION_FILL,
  PORT_FILL_FILL
} from '../../content_script/messages/constants'
import {
  parseResult,
  setLastUsedResult,
  getLastUsedResult
} from './messageTools'

const flowLogger = new Logger('Fill', messageLogger)

class StoredSafeFillFlowError extends StoredSafeError {}

function fill (port: browser.runtime.Port, result: SSObject, remember: boolean = true) {
  if (remember) setLastUsedResult(port.sender.url, result)
  parseResult(result).then(values => {
    port.postMessage({
      type: `${FLOW_FILL}.${ACTION_FILL}`,
      data: values
    })
  })
}

/**
 * Initiate a fill flow to attempt to fill forms on page.
 */
export class FillFlow {
  private static flows: Map<number, FillFlow> = new Map()

  private tabId: number
  private contentPort: browser.runtime.Port = null
  private results: SSObject[]

  private logger: Logger

  /**
   * Create a new fill flow for the active tab.
   * @param contentPort - Port for the content script on the currently active tab.
   * @param results - StoredSafe data to fill forms with.
   */
  static Create (contentPort: browser.runtime.Port, results: SSObject[]): void {
    if (contentPort?.sender?.tab?.id === undefined)
      throw new StoredSafeFillFlowError('Sender has no tab ID.')

    // No results, do nothing
    if (results.length < 1) return

    // Single result, fill
    if (results.length === 1) {
      return fill(contentPort, results[0])
    }

    getLastUsedResult(contentPort.sender.url).then(lastUsed => {
      if (lastUsed !== undefined) {
        const { host, objectId } = lastUsed
        const result = results.find(
          result => result.host === host && result.id === objectId
        )
        if (result !== undefined) {
          // Preferred result from preferences
          return fill(contentPort, result, false)
        }
      }

      // Present choice
      const tab = contentPort.sender.tab
      const flow = FillFlow.flows.get(tab.id)
      if (flow !== undefined) {
        flow.cancel()
      }
      FillFlow.flows.set(tab.id, new FillFlow(contentPort, results))
    })
  }

  /**
   * Start a new fill flow.
   * @param initPort Port for the content script on the currently active tab.
   * @param results StoredSafe results availble for fill
   */
  private constructor (contentPort: browser.runtime.Port, results: SSObject[]) {
    this.onContentDisconnect = this.onContentDisconnect.bind(this)
    this.onIframeConnect = this.onIframeConnect.bind(this)
    this.onIframeDisconnect = this.onIframeDisconnect.bind(this)
    this.onIframeMessage = this.onIframeMessage.bind(this)
    this.onConnect = this.onConnect.bind(this)
    this.cancel = this.cancel.bind(this)

    this.contentPort = contentPort
    this.results = results

    this.tabId = this.contentPort.sender.tab.id
    this.contentPort.onDisconnect.addListener(this.onContentDisconnect)

    this.logger = new Logger(
      `(${contentPort.sender.tab.url}) [${contentPort.sender.tab.id}]`,
      flowLogger
    )

    this.contentPort.postMessage({
      type: `${FLOW_FILL}.${ACTION_OPEN}`
    })
    browser.runtime.onConnect.addListener(this.onConnect)
  }

  /**
   * Tear-down procedure for when content page disconnectes (on reload)
   */
  private onContentDisconnect (): void {
    this.contentPort.onDisconnect.removeListener(this.onContentDisconnect)
    this.contentPort = null
    this.cancel()
  }

  /**
   * When the iframe connects, it is ready to recieve the flow data.
   */
  private onIframeConnect (port: browser.runtime.Port): void {
    this.logger.debug('Connected to iframe port %s', port.name)

    if (port.name === PORT_FILL_CONNECTED) {
      port.postMessage({
        type: `${FLOW_FILL}.${ACTION_POPULATE}`,
        data: this.results
      })
    } else if (
      port.name === PORT_FILL_CLOSE ||
      port.name === PORT_FILL_RESIZE ||
      port.name === PORT_FILL_FILL
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
    if (flow !== FLOW_FILL) {
      return // Other flow from same tab
    }
    if (action === ACTION_CLOSE) {
      this.cancel()
    } else if (action === ACTION_RESIZE) {
      this.contentPort.postMessage(message) // Forward message to content_script
    } else if (action === ACTION_FILL) {
      fill(this.contentPort, message.data)
    } else {
      throw new StoredSafeFillFlowError(`Unknown message ${flow}.${action}`)
    }
  }

  /**
   * Handle incoming connections from other scripts.
   * Will only handle incoming connections from the same tab that started the flow.
   * @param port Connecting port.
   */
  private onConnect (port: browser.runtime.Port): void {
    if (port.sender?.tab?.id === this.contentPort.sender?.tab?.id) {
      if (port.name.match(PORT_FILL_PREFIX) !== null) {
        this.onIframeConnect(port)
      }
    }
  }

  /**
   * Cancel fill flow and discard FillFlow object.
   */
  private cancel (): void {
    browser.runtime.onConnect.removeListener(this.onConnect)
    if (this.contentPort !== null) {
      this.contentPort.postMessage({
        type: `${FLOW_FILL}.${ACTION_CLOSE}`
      })
    }
    FillFlow.flows.delete(this.tabId)
  }
}
