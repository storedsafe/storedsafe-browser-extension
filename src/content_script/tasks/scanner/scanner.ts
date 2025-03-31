import { Logger, LogLevel } from "@/global/logger";
import {
  FormType,
  FORM_FILL_TYPES,
  FORM_SAVE_TYPES,
  InputType,
} from "./constants";
import type { Form } from "./forms";
import { getForms } from "./forms";
import { getInputs, INPUT_SELECTORS } from "./inputs";

const logger = new Logger("scanner", true);

function printForms(forms: Form[]) {
  for (const { root, type, inputs } of forms) {
    if (type === FormType.UNKNOWN) {
      logger.debug("Unknown form %o", root);
      continue;
    }
    if (type === FormType.HIDDEN) {
      logger.debug("Hidden form %o", root);
      continue;
    }
    logger.group(type + " form", LogLevel.DEBUG);
    logger.debug("%o", root);
    for (const [input, inputType] of inputs) {
      if (inputType === InputType.HIDDEN) {
      }
      logger.debug("%s %o", inputType, input);
    }
    logger.groupEnd(LogLevel.DEBUG);
  }
}

function filterForms(forms: Form[]): Form[] {
  return forms.filter(
    ({ type }) =>
      FORM_FILL_TYPES.includes(type) || FORM_SAVE_TYPES.includes(type)
  );
}

export function scanner(cb: (forms: Form[]) => void) {
  let forms: Form[] = [];

  function updateForms(newForms: Form[]) {
    printForms(newForms);
    forms = filterForms(newForms);
    cb(forms);
  }
  updateForms(getForms(getInputs()));

  let rescanTimeoutId: null | number = null;
  let firstTimeoutTimestamp: null | number;
  const observer = new MutationObserver((mutations) => {
    let shouldRescan = false;
    for (const mutation of mutations) {
      if (shouldRescan) break;
      // Added nodes
      for (const node of [...mutation.addedNodes, ...mutation.removedNodes]) {
        if (node instanceof HTMLElement) {
          // Skip if node has no relevant elements
          if (
            INPUT_SELECTORS.includes(node.nodeName.toLowerCase()) ||
            node.querySelector(INPUT_SELECTORS) ||
            node.parentElement === null
          ) {
            shouldRescan = true;
            break;
          }
        }
      }
    }
    if (shouldRescan) {
      // Only rescan after 500ms of no changes to avoid unnecessary scans
      let now = +new Date();
      if (rescanTimeoutId) {
        if (!firstTimeoutTimestamp) {
          firstTimeoutTimestamp = now;
        }
        window.clearTimeout(rescanTimeoutId);
      }
      if (firstTimeoutTimestamp && now - firstTimeoutTimestamp > 5000) {
        // Avoid getting caught in endless loop if the page keeps updating.
        // Will update at least every 5th second.
        logger.info("Rescanning forms (after 5 second timeout)...");
        updateForms(getForms(getInputs()));
        firstTimeoutTimestamp = null;
      } else {
        rescanTimeoutId = window.setTimeout(() => {
          logger.info("Rescanning forms...");
          updateForms(getForms(getInputs()));
          firstTimeoutTimestamp = null;
        }, 500);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return {
    stop() {
      observer.disconnect();
    },
  };
}
