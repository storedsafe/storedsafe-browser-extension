import { Logger, LogLevel } from "../../../global/logger";
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
  for (const [form, formType, inputs] of forms) {
    if (formType === FormType.UNKNOWN) {
      logger.debug("Unknown form %o", form);
      continue;
    }
    if (formType === FormType.HIDDEN) {
      logger.debug("Hidden form %o", form);
      continue;
    }
    logger.group(formType + " form", LogLevel.DEBUG);
    logger.debug("%o", form);
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
    ([_form, formType]) =>
      FORM_FILL_TYPES.includes(formType) || FORM_SAVE_TYPES.includes(formType)
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

  const observer = new MutationObserver((mutations) => {
    const newForms: Map<HTMLElement, Form> = new Map();
    const scanQueue: Set<HTMLElement> = new Set();
    for (const mutation of mutations) {
      // Added nodes
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          // Skip if node has no relevant elements
          if (
            !(
              INPUT_SELECTORS.includes(node.nodeName.toLowerCase()) ||
              node.querySelector(INPUT_SELECTORS)
            )
          )
            continue;
          let isChildNode = false;
          // Deletes forms from previous iterations if this node is a parent to them.
          // Marks the node not to be added if it's a child of a previous form.
          for (const element of scanQueue) {
            if (node.contains(element)) {
              // Delete any elements that contain this node
              scanQueue.delete(element);
            } else if (element.contains(node)) {
              isChildNode = true;
            }
          }

          // Checks if the added node is part of an existing form,
          // or if the new node is a parent of an existing form.
          for (const form of forms) {
            if (form[0].contains(node)) {
              // If form contains node, rescan form
              scanQueue.add(form[0]);
              isChildNode = true;
            } else if (!node.contains(form[0])) {
              // If the form is unrelated to the change, leave it as is.
              newForms.set(form[0], form);
            } // else: form is child to node, node will be used instead.
          }
          if (!isChildNode) scanQueue.add(node);
        }
      }

      // Checks if the removed nodes were related to existing forms.
      for (const node of mutation.removedNodes) {
        if (node instanceof HTMLElement) {
          for (const form of forms) {
            if (form[0].contains(node)) {
              // If the form contains the node, rescan then form.
              scanQueue.add(form[0]);
            } else if (!node.contains(form[0])) {
              // If the form is not inside the removed node, leave it as is.
              newForms.set(form[0], form);
            }
          }
        }
      }
    }

    if (scanQueue.size > 0) {
      logger.debug("Mutations observed, rescanning %d nodes", scanQueue.size);
      // Find smallest common parent node for minimal rescan
      const scanList = Array.from(scanQueue);
      let parent = scanList[0].parentElement;
      let i = 0;
      while (i < scanList.length && parent && parent !== document.body) {
        if (parent.contains(scanList[i])) {
          i++;
        } else if (scanList[i] === parent || scanList[i].contains(parent)) {
          let newParent = scanList[i].parentElement;
          if (newParent) parent = newParent;
          i++;
        } else {
          let newParent = parent.parentElement;
          if (newParent) parent = newParent;
        }
      }
      if (parent === null) {
        logger.error("Unexpected parent element with value `null`");
        logger.debug("Current scan queue: %o", scanQueue);
      } else {
        const elementForms = getForms(getInputs(parent));
        console.log("PARENT %o\nFORMS %o", parent, elementForms);
        for (const form of elementForms) {
          newForms.set(form[0], form);
        }
        updateForms([...newForms.values()]);
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
