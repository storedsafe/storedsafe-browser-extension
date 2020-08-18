import StoredSafeError from '../../../utils/StoredSafeError'
import Logger from '../../../utils/Logger'
import { logger as messageLogger } from '.'
import { FLOW_SAVE, ACTION_OPEN } from '../../content_script/messages'

const flowLogger = new Logger('Save', messageLogger)

class StoredSafeSaveFlowError extends StoredSafeError {}

export function createSaveFlow (initPort: browser.runtime.Port) {
  if (initPort.sender?.tab?.id === undefined) {
    throw new StoredSafeSaveFlowError(
      `Tab ID for port ${initPort} is undefined`
    )
  }

  const logger = new Logger(
    `(${initPort.sender.tab.url}) [${initPort.sender.tab.id}]`,
    flowLogger
  )

  let contentPort: browser.runtime.Port = initPort
  let iframePort: browser.runtime.Port = null

  // Open save prompt if page is not loading when connected.
  // This can be the case for example with single page applications
  // that don't actually redirect you to a new page.
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(([tab]) => {
      logger.log('Tab Status %s', tab.status)
      if (tab.status === 'complete') {
        initPort.postMessage({ type: `${FLOW_SAVE}.${ACTION_OPEN}` })
      }
    })
    .catch(error => {
      logger.error('Error querying status of tab %o', error)
    })

  function onMessage ({ type, data }: Message) {
    const [flow, action] = type.split('.')
    if (flow !== FLOW_SAVE) {
      return // Other flow from same tab
    }
  }

  function onConnect (port: browser.runtime.Port) {
    if (port.sender) {
    }
  }

  function onDisconnect () {}
}
