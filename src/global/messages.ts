import { Logger } from "./logger";

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

/**
 * Returns active tab if it is within the scope of the browser extension,
 * otherwise null.
 */
async function getActiveTab() {
  const activeTabs = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });
  if (activeTabs.length <= 0) return null;
  const tab = activeTabs[0];
  if (!tab.id || !tab.url) return null;
  if (await browser.permissions.contains({ origins: [tab.url] })) return tab;
  // No permissions on tab url
  return null;
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
