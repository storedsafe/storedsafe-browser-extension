export interface Message {
  context: string
  action: string
  data?: any
}

export function sendMessage (message: Message): Promise<Message | void> {
  return browser.runtime.sendMessage(message)
}
