import { Logger } from "../../global/logger"

const logger = new Logger('fillflow')

/**
 * Open prompt to ask user to chose their object preferences for filling forms.
 * @param url URL of current tab, used for fill preferences.
 * @param tabId ID of current tab, for tab communications.
 * @param tabResults Results related to the current tab.
 */
export function fillFlow(url: string, tabId: number, tabResults: StoredSafeObject[]) {
  function onFillConnect(port: browser.runtime.Port) {
    port.postMessage({
      context: 'fill',
      action: 'populate',
      data: {
        results: tabResults,
        url
      }
    })
  }

  function onConnect(port: browser.runtime.Port) {
    if (port.name === 'fill' && port.sender?.tab?.id === tabId) {
      onFillConnect(port)
    }
  }

  browser.runtime.onConnect.addListener(onConnect)

  browser.tabs.sendMessage(tabId, {
    context: 'fill',
    action: 'open'
  }).catch(logger.error)

  return function stop() {
    browser.runtime.onConnect.removeListener(onConnect)
  }
}
