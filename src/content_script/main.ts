import {
  Context,
  isMessage,
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

  browser.runtime.onMessage.addListener(
    messageListener((message) => {
      if (message.action === "scan") onScan(message);
    })
  );

  try {
    const res = await sendMessage({ context, action: "connect" });
    if (isMessage(res) && res.action == "scan") onScan(res);
  } catch (e) {
    logger.warn("No listeners for sendMessage %o", e);
  }

  function onScan(message: Message) {
    scanner((forms) => {
      if (forms.length > 0) {
        logger.log("Detected forms: %o", forms);
        const formTypes = [...new Set(forms.map((form) => form.type))];
        sendMessage({
          context,
          action: "forms",
          data: {
            formTypes,
            hosts: message.data?.hosts,
          },
        });
      }
    });
  }
});
