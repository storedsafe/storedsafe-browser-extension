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
  FORM_SAVE_TYPES,
  getStrippedType,
  INPUT_FILL_TYPES,
  InputType,
  scanner,
  type Form,
} from "./tasks/scanner";
import { onIframeMessage } from "./tasks/createIframe";

let currentForms: Form[] = [];
let submitListeners: Map<HTMLElement, [string, () => void]> = new Map();
let isOriginalForms: boolean = true;

Logger.Init().then(async () => {
  const logger = new Logger("content_script");
  logger.log("Content Script Loaded");

  browser.runtime.onMessage.addListener(
    messageListener((message) => {
      logger.debug("Incoming message: %o", message);
      if (message.action === "scan") onScan(message);
      if (message.action === "fill") onFill(message);
      if (message.action.startsWith("iframe")) {
        onIframeMessage(message);
      }
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

  let submitLock = false;
  function onSubmit(form: Form) {
    if (!submitLock) {
      submitLock = true;

      let data: Record<string, string> = {};
      data["name"] = document.title.substring(0, 128);
      data["url"] = document.location.origin + document.location.pathname;
      for (const { element, type } of form.inputs) {
        if (INPUT_FILL_TYPES.includes(type)) {
          data[type] = (element as HTMLInputElement).value;
        }
      }

      logger.debug("Submitted form: %o %o", form, data);

      sendMessage({
        from: Context.CONTENT_SCRIPT,
        to: Context.BACKGROUND,
        action: "submit",
        data,
      });

      window.setTimeout(() => (submitLock = false), 100);
    }
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
            isOriginalForms,
          },
        });
        // Stop from repeating events such as autofill when the page changes.
        if (isOriginalForms) isOriginalForms = false;
      }

      for (const [element, [type, cb]] of submitListeners) {
        element.removeEventListener(type, cb);
      }

      for (const form of forms) {
        if (FORM_SAVE_TYPES.includes(form.type)) {
          const cb = () => onSubmit(form);
          if (form.root instanceof HTMLFormElement) {
            submitListeners.set(form.root, ["submit", cb]);
            form.root.addEventListener("submit", cb);
          }
          for (const { element, type } of form.inputs) {
            if (type === InputType.SUBMIT) {
              submitListeners.set(element, ["click", cb]);
              element.addEventListener("click", cb);
            }
          }
        }
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
