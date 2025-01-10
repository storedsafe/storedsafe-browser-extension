export interface Message {
  context: string
  action: string
  data?: any
}

export function sendMessage(message: Message, port?: browser.runtime.Port): Promise<Message | void> {
  if (!!port) {
    port.postMessage(message)
    return Promise.resolve()
  } else {
    return browser.runtime.sendMessage(message)
  }
}
