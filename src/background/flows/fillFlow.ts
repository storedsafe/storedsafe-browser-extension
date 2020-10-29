export function fillFlow (url: string, tabId: number, tabResults: StoredSafeObject[]) {
  function onFillConnect (port: browser.runtime.Port) {
    port.postMessage({
      context: 'fill',
      action: 'populate',
      data: {
        results: tabResults,
        url
      }
    })
  }

  function onConnect (port: browser.runtime.Port) {
    console.log('CONNECT %o', port)
    if (port.name === 'fill' && port.sender?.tab?.id === tabId) {
      onFillConnect(port)
    }
  }

  browser.runtime.onConnect.addListener(onConnect)

  browser.tabs.sendMessage(tabId, {
    context: 'fill',
    action: 'open'
  })

  return function stop () {
    browser.runtime.onConnect.removeListener(onConnect)
  }
}
