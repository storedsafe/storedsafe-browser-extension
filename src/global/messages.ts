export interface Message {
  context: string;
  action: string;
  data?: any;
}

export function sendMessage(
  message: Message,
  port?: browser.runtime.Port
): Promise<Message | void> {
  if (!!port) {
    port.postMessage(message);
    return Promise.resolve();
  } else {
    return browser.runtime.sendMessage(message);
  }
}

export function addMessageListener(
  port: browser.runtime.Port,
  cb: (message: Message) => void
) {
  port.onMessage.addListener((response) => {
    if (isMessage(response)) {
      cb(response as Message);
    }
  });
}

export function isMessage(response: object): response is Message {
  return "context" in response && "action" in response;
}
