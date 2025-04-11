import {
  Context,
  isMessage,
  messageListener,
  sendMessage,
  type Message,
} from "@/global/messages";
import { Logger } from "../global/logger";
import {
  FORM_FILL_TYPES,
  getStrippedType,
  INPUT_FILL_TYPES,
  scanner,
  type Form,
} from "./tasks/scanner";

let currentForms: Form[] = [];

Logger.Init().then(async () => {
  const logger = new Logger("content_script");
  logger.log("Content Script Loaded");

  browser.runtime.onMessage.addListener(
    messageListener((message) => {
      logger.debug("Incoming message: %o", message);
      if (message.action === "scan") onScan(message);
      if (message.action === "fill") onFill(message);
    })
  );

  try {
    const res = await sendMessage({
      from: Context.CONTENT_SCRIPT,
      to: Context.BACKGROUND,
      action: "connect",
    });
    if (isMessage(res) && res.action == "scan") onScan(res);
  } catch (e) {
    logger.warn("No listeners for sendMessage %o", e);
  }

  /**
   * Scan the page for forms and send the results to the background script.
   * Also updates the
   * @param message Optionally contains subset of hosts for limited update (on login).
   */
  function onScan(message: Message) {
    scanner((forms) => {
      currentForms = forms;
      if (forms.length > 0) {
        logger.debug("Detected forms: %o", forms);
        const formTypes = [...new Set(forms.map((form) => form.type))];
        sendMessage({
          from: Context.CONTENT_SCRIPT,
          to: Context.BACKGROUND,
          action: "forms",
          data: {
            formTypes,
            hosts: message.data?.hosts,
          },
        });
      }
    });
  }

  /**
   * Fill forms on the page with data from StoredSafe.
   * @param message The StoredSafe object to fill the forms with.
   */
  function onFill(message: Message) {
    if (!message.data) {
      logger.warn("No fill data, skipping fill.");
      return;
    }
    for (const form of currentForms) {
      if (FORM_FILL_TYPES.includes(form.type)) {
        for (const input of form.inputs) {
          if (
            INPUT_FILL_TYPES.includes(input.type) &&
            input.element instanceof HTMLInputElement
          ) {
            input.element.value = message.data[getStrippedType(input.type)];
            input.element.dispatchEvent(
              new InputEvent("input", { bubbles: true })
            );
          }
        }
      }
    }
  }
});
