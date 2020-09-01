/**
 * This script is run in the background by the browser as defined in the extension
 * manifest. In chromium-based browsers it will run as an event page whereas in
 * firefox it will be persistent as firefox does not supportevent pages.
 *
 * All handling of browser events should be handled in this module to the
 * extent that it's possible. Messages can be passed through the background
 * script to enable communication between the content script and iframes or
 * the popup and the content script.
 * */
import Logger from '../utils/Logger'
export const logger = new Logger('Background')

import { actions as StoredSafeActions } from '../model/storedsafe/StoredSafe'
import { actions as SettingsActions } from '../model/storage/Settings'

/**
 * START REFACTORED CODE
 * TODO: Remove comment
 */
import {
  IdleHandler,
  KeepAliveHandler,
  TimeoutHandler,
  OnlineStatusHandler
} from './background/sessions'
import { PortHandler } from './background/messages'
import StoredSafeError from '../utils/StoredSafeError'
import { FLOW_FILL, ACTION_INIT } from './content_script/messages/constants'
import { TabHandler } from './background/search'

logger.log('Background script initialized: ', new Date(Date.now()))

// Invalidate sessions after being idle for some time
const idleHandler = new IdleHandler()
browser.idle.onStateChanged.addListener(idleHandler.onIdleChange)

KeepAliveHandler.StartTracking()
TimeoutHandler.StartTracking()
OnlineStatusHandler.StartTracking()
PortHandler.StartTracking()
TabHandler.StartTracking()

/**
 * END REFACTORED CODE
 * TODO: Remove comment
 */

/**
 * Helper function to select the first result of all results if a result exists.
 * @param results - All search results related to tab.
 * TODO: Sort results on best match?
 * */
function selectResult (results: SSObject[]): SSObject {
  return results[0]
}

/**
 * Decrypt result if needed.
 * */
async function decryptResult (
  host: string,
  result: SSObject
): Promise<SSObject> {
  if (result.isDecrypted) return result
  const hasEncrypted = result.fields.reduce(
    (acc, field) => acc || field.isEncrypted,
    false
  )
  if (hasEncrypted) {
    return await StoredSafeActions.decrypt(host, result.id)
  }
  return result
}

/**
 * Prepare fields for fill function and decrypt if needed.
 * */
function parseResult (
  result: SSObject
): Map<string /* field */, string /* value */> {
  const data: Map<string, string> = new Map()
  for (const field of result.fields) {
    data.set(field.name, field.value)
  }
  return data
}

/**
 * Parse and select result and decrypt as needed before filling form fields on tab.
 * */
async function fill (results: SSObject[]): Promise<void> {
  const result = selectResult(results)
  if (result !== undefined) {
    const decryptedResult = decryptResult(result.host, result)
    const data = parseResult(await decryptedResult)
    PortHandler.SendFill([...data])
  }
}

/**
 * Copy text to clipboard and clear clipboard after some amount of time.
 * @param value - Value to be copied to clipboard.
 * @param clearTimer - Time to clear clipboard in ms.
 * TODO: Fix clear timer when not focused.
 * */
async function copyToClipboard (
  value: string,
  clearTimer = 10e5
): Promise<void> {
  await navigator.clipboard.writeText(value)
  setTimeout(() => {
    navigator.clipboard.writeText('').catch(error => {
      console.error(error)
    })
  }, clearTimer)
}

/// /////////////////////////////////////////////////////////
// Event handler functions

/**
 * Message handler for specific types of messages.
 * @param data - Data as determined by the message type.
 * @param sender - Script or tab that sent the message.
 * */
type MessageHandler<T> = (
  data: T,
  sender: browser.runtime.MessageSender
) => Promise<any>

/**
 * Mapped responses to message types.
 * */
const messageHandlers: {
  getTabResults: MessageHandler<SSObject[]>
  copyToClipboard: MessageHandler<string>
  [key: string]: MessageHandler<unknown>
} = {
  copyToClipboard: async value => await copyToClipboard(value),
  getTabResults: async () => {
    const [tab] = await browser.tabs.query({
      currentWindow: true,
      active: true
    })
    const results = TabHandler.GetResults(tab.id)
    console.log('RESULTS GET', results)
    return results
  }
}

/**
 * Handle messages received from other scripts.
 * */
async function onMessage (
  message: {
    type: string
    data: unknown
  },
  sender: browser.runtime.MessageSender
): Promise<void> {
  console.log('MESSAGE', message, sender)
  const handler = messageHandlers[message.type]
  if (handler !== undefined) {
    return await handler(message.data, sender)
  }
  // throw new Error(`Invalid message type: ${message.type}`) // other scripts can get messages
}

function onCommand (command: string): void {
  if (command === 'fill') {
    void (async () => {
      const [tab] = await browser.tabs.query({
        currentWindow: true,
        active: true
      })
      await fill(TabHandler.GetResults(tab.id))
    })()
  }
}

// React to messages from other parts of the extension
browser.runtime.onMessage.addListener(onMessage)

// React to keyboard commands defined in the extension manifest
browser.commands.onCommand.addListener(onCommand)
