import { Logger } from "./logger";
import { getActiveTab } from "./utils";

export enum Context {
  CONTENT_SCRIPT = "content_script",
  BACKGROUND = "background",
  SAVE = "save",
  FILL = "fill",
  IFRAME = "iframe",
  POPUP = "popup",
}

export interface Message {
  from: Context;
  to: Context;
  action: string;
  data?: any;
}

async function getMessageLogger() {
  await Logger.Init();
  return new Logger("messages");
}

export async function sendTabMessage(message: Message): Promise<any> {
  const logger = await getMessageLogger();
  const activeTab = await getActiveTab();
  if (!activeTab || !activeTab.id) {
    logger.warn("Tried to send message to unavailable tab.");
    return;
  }
  return await browser.tabs.sendMessage(activeTab.id, message);
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
  return "from" in response && "to" in response && "action" in response;
}
