export enum Context {
  CONTENT_SCRIPT = "content_script",
  BACKGROUND = "background",
  SAVE = "save",
  FILL = "fill",
  IFRAME = "iframe",
  POPUP = "popup"
}

export interface Message {
  context: Context;
  action: string;
  data?: any;
}

export async function sendTabMessage(
  tabId: number,
  message: Message
): Promise<any> {
  return await browser.tabs.sendMessage(tabId, message);
}

export async function sendMessage(
  message: Message,
  port?: browser.runtime.Port
): Promise<any> {
  if (port) {
    return port.postMessage(message);
  } else {
    return await browser.runtime.sendMessage(message);
  }
}

export function messageListener(
  cb: (
    message: Message,
    sender: browser.runtime.MessageSender,
    respond: (response?: any) => void
  ) => void
) {
  return async function onResponse(
    response: object,
    sender: browser.runtime.MessageSender,
    respond: (response?: any) => void
  ) {
    if (isMessage(response)) {
      return cb(response as Message, sender, respond);
    }
  };
}

export function isMessage(response: object): response is Message {
  if (!response) return false;
  return "context" in response && "action" in response;
}
