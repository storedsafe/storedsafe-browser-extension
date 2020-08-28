import StoredSafeError from '../../../utils/StoredSafeError'
import Logger from '../../../utils/Logger'
import { logger as messageLogger } from '.'
import {
  FLOW_SAVE,
  ACTION_OPEN,
  PORT_CONTENT,
  PORT_SAVE,
  ACTION_CLOSE,
  ACTION_RESIZE,
  ACTION_POPULATE,
  ACTION_INIT
} from '../../content_script/messages/constants'
import { saveURLToField, shouldSave } from './messageTools'

const flowLogger = new Logger('Save', messageLogger)

// Stop trying to open save prompt after `SAVE_RETRIES` attempts
const SAVE_RETRIES = 3
// Stop trying to open save prompt after `SAVE_TIMEOUT` ms
const SAVE_TIMEOUT = 3e4

class StoredSafeSaveFlowError extends StoredSafeError {}

// CRITERIA:
// 1. Is online
// 2. Not in ignore list
// 3. No match in cached results

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
export function createSaveFlow (
  initPort: browser.runtime.Port,
  data: [string, string][]
) {
  // Only accept save flow from tabs
  if (initPort.sender?.tab?.id === undefined) {
    throw new StoredSafeSaveFlowError(
      `Tab ID for port ${initPort} is undefined`
    )
  }

  shouldSave(initPort.sender?.url, data)
    .then(save => {
      if (save) startFlow()
    })
    .catch(() => {
      throw new StoredSafeSaveFlowError(
        'Failed to check whether the save flow should be started.'
      )
    })

  function startFlow () {
    // Generate value format expected by save prompt, fill out missing fields
    const values: SaveValues = {
      url: saveURLToField(initPort.sender?.url),
      name: initPort.sender?.tab?.title
    }
    // TODO: Handle duplicate keys (for example poor username matching with multiple username-like fields)
    for (const [key, value] of data) {
      values[key] = value
    }

    // Set up logger with tab info
    const logger = new Logger(
      `(${initPort.sender.tab.url}) [${initPort.sender.tab.id}]`,
      flowLogger
    )

    logger.log('VALUES %o', values)

    // Reference to content_script port
    let contentPort: browser.runtime.Port = null
    // Reference to injected frame port
    let iframePort: browser.runtime.Port = null
    // Counter for `SAVE_RETRIES`
    let promptCount = 0
    // Reference for `SAVE_TIMEOUT` status
    let hasTimedOut = false
    setTimeout(() => (hasTimedOut = true), SAVE_TIMEOUT)

    // Assign origin port to content_script port reference
    onContentConnect(initPort)

    /**
     * Tear-down procedure for when content_script disconnects (usually reload).
     */
    function onContentDisconnect () {
      contentPort.onDisconnect.removeListener(onContentDisconnect)
      contentPort = null
    }

    /**
     * When the content_script connects, the save prompt should be opened if the
     * `SAVE_RETRIES` threshold has not been exceeded.
     * @param port Connecting content_script port.
     */
    function onContentConnect (port: browser.runtime.Port) {
      logger.debug('Connected to content port')
      port.onDisconnect.addListener(onContentDisconnect)
      contentPort = port

      // Listen for new save flows on the same tab
      contentPort.onMessage.addListener((message: Message) => {
        if (message.type === `${FLOW_SAVE}.${ACTION_INIT}`) {
          // Cancel this flow
          browser.runtime.onConnect.removeListener(onConnect)
        }
      })

      if (promptCount++ <= SAVE_RETRIES && hasTimedOut === false) {
        contentPort.postMessage({
          type: `${FLOW_SAVE}.${ACTION_OPEN}`
        })
      } else {
        // Flow is finished, perform cleanup
        port.disconnect()
        browser.runtime.onConnect.removeListener(onConnect)
      }
    }

    /**
     * Tear-down procedure for when iframe disconnects (on close frame / reload)
     */
    function onIframeDisconnect () {
      iframePort.onDisconnect.removeListener(onIframeDisconnect)
      iframePort.onMessage.removeListener(onMessage)
    }

    /**
     * When the iframe connects, it is ready to recieve the flow data.
     */
    function onIframeConnect (port: browser.runtime.Port) {
      logger.debug('Connected to iframe port')
      port.onDisconnect.addListener(onIframeDisconnect)
      port.onMessage.addListener(onMessage)
      iframePort = port
      iframePort.postMessage({
        type: `${FLOW_SAVE}.${ACTION_POPULATE}`,
        data: values
      })
    }

    /**
     * Receive messages from iframe port to change the state of the iframe,
     * which can only be done from outside the frame.
     * @param message Message from iframe.
     */
    function onMessage (message: Message) {
      const [flow, action] = message.type.split('.')
      if (flow !== FLOW_SAVE) {
        return // Other flow from same tab
      }
      if (action === ACTION_CLOSE || action === ACTION_RESIZE) {
        contentPort.postMessage(message) // Forward message to content_script
      } else {
        throw new StoredSafeSaveFlowError(`Unknown message ${flow}.${action}`)
      }
    }

    /**
     * Handle incoming connections from other scripts.
     * Will only handle incoming connections from the same tab that started the flow.
     * @param port Connecting port.
     */
    function onConnect (port: browser.runtime.Port) {
      if (port.sender?.tab?.id === initPort.sender.tab?.id) {
        if (port.name === PORT_CONTENT) {
          onContentConnect(port)
        } else if (port.name === PORT_SAVE) {
          onIframeConnect(port)
        }
      }
    }
    browser.runtime.onConnect.addListener(onConnect)
  }
}
