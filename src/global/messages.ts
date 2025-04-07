export enum Context {
  CONTENT_SCRIPT = "content_script",
  BACKGROUND = "background",
  SAVE = "save",
  FILL = "fill",
  IFRAME = "iframe",
  AUTO_SEARCH = "autosearch",
}

export interface Message {
  context: Context;
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

export function messageListener(cb: (message: Message) => void) {
  return (response: object) => {
    if (isMessage(response)) {
      cb(response as Message);
    }
  };
}

export function isMessage(response: object): response is Message {
  return "context" in response && "action" in response;
}
