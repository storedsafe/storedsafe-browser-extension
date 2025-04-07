import {
  Context,
  messageListener,
  sendMessage,
  type Message,
} from "@/global/messages";
import { Logger } from "../global/logger";
import { scanner } from "./tasks/scanner";

const context = Context.CONTENT_SCRIPT;

Logger.Init().then(async () => {
  const logger = new Logger("content_script");
  logger.log("Content Script Loaded");

  try {
    const port = browser.runtime.connect({ name: context });
    const onMessage = messageListener((message) => {
      if (message.context == Context.BACKGROUND) {
        onBackgroundMessage(port, message);
      }
    });
    port.onMessage.addListener(onMessage);
    port.onDisconnect.addListener(() => {
      port.onMessage.removeListener(onMessage);
    });
  } catch (e) {
    logger.warn("No listeners for sendMessage");
  }

  function onBackgroundMessage(port: browser.runtime.Port, message: Message) {
    if (message.action === "scan") {
      scanner((forms) => {
        if (forms.length > 0) {
          logger.log("Detected forms: %o", forms);
          const formTypes = forms.map((form) => form.type);
          sendMessage({ context, action: "forms", data: formTypes }, port);
        }
      });
    }
  }
});
