import type { Message } from '../../global/messages'

const MAX_DURATION_SECONDS = 30

export function saveFlow (
  values: Record<string, string>,
  tabId: number
): () => void {
  let timeoutId = window.setTimeout(close, MAX_DURATION_SECONDS * 1e3)

  function onSaveConnect (port: browser.runtime.Port) {
    port.postMessage({
      context: 'save',
      action: 'populate',
      data: values
    })
  }

  function onContentConnect (port: browser.runtime.Port) {
    port.postMessage({
      context: 'save',
      action: 'open'
    })
  }

  function onConnect (port: browser.runtime.Port) {
    if (port.sender?.tab?.id === tabId) {
      if (port.name === 'save') {
        onSaveConnect(port)
      } else if (port.name === 'content') {
        onContentConnect(port)
      }
    }
  }

  browser.runtime.onConnect.addListener(onConnect)

  return function stop () {
    window.clearTimeout(timeoutId)
    browser.runtime.onConnect.removeListener(onConnect)
  }
}
