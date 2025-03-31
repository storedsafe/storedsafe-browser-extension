import { Logger, LogLevel } from "../../../global/logger";
import { FormType, InputType } from "./constants";
import {
  formMatchers,
  matchAttributes,
  matchFields,
  matchName,
} from "./matchers";
import type { Input } from "./inputs";

export interface Form {
  root: HTMLElement;
  type: FormType;
  inputs: Input[];
}

const logger = new Logger("forms", true);

/**
 * Map all inputs to common parents which potentially act as forms.
 * Solo inputs will be discarded as at least one input and one submit
 * element is required to compose a form-like structure.
 * If there are multiple groups of form-like structures on the page,
 * there will be common parent groups in the results from this function
 * which contain the smaller groupings. These should be filtered out after
 * if the smaller groupings are complete form-like structures.
 * @param inputs All relevant elements under the `root` node.
 * @param root The level element where the scan was initiated from.
 */
function mapInputContexts(
  inputs: Input[],
  root = document.body
): [HTMLElement, Input[]][] {
  const forms: Map<HTMLElement, Input[]> = new Map();
  for (let i = 0; i < inputs.length - 1; i++) {
    let matchedElements: Input[] = [];
    let unmatchedElements: Input[];
    const current: HTMLElement = inputs[i][0];
    let others = inputs.slice(i + 1);
    let parent = current.parentElement;
    while (
      others.length > 0 &&
      parent !== root.parentElement &&
      parent != null
    ) {
      if (!!forms.get(parent)) break;
      unmatchedElements = [];
      for (const other of others) {
        if (parent.contains(other[0])) matchedElements.push(other);
        else unmatchedElements.push(other);
      }
      if (matchedElements.length > 0)
        forms.set(parent, [inputs[i], ...matchedElements]);
      // Parent of parent will also contain the already matched elements
      others = unmatchedElements;
      parent = parent.parentElement;
    }
  }
  return [...forms];
}

function parseContext(form: [HTMLElement, Input[]]): Form {
  const [parent, inputs] = form;

  const hidden: Input[] = [];
  const submits: Input[] = [];
  const maybeSubmits: Input[] = [];
  const matchable: Input[] = [];

  // Group inputs first to reduce required number of iterations
  for (const input of inputs) {
    const inputType = input[1];
    if (inputType === InputType.UNKNOWN) continue;
    else if (inputType === InputType.HIDDEN) hidden.push(input);
    else if (inputType === InputType.SUBMIT) submits.push(input);
    else if (inputType === InputType.MAYBE_SUBMIT) maybeSubmits.push(input);
    else matchable.push(input);
  }

  // Helper function to return form in proper format
  function createForm(formType: FormType, formInputs: Input[] = inputs): Form {
    return {
      root: parent,
      type: formType,
      inputs: formInputs,
    };
  }

  // Helper function to return form with the correct submit elements
  function createMatchableForm(formType: FormType): Form {
    const formInputs: Input[] = [...matchable, ...hidden];
    if (submits.length > 0) formInputs.push(...submits);
    else {
      formInputs.push(...maybeSubmits);
    }
    return createForm(formType, formInputs);
  }

  // Special cases
  if (hidden.length === inputs.length) {
    logger.debug("Hidden form: %o", parent);
    return createForm(FormType.HIDDEN);
  }
  if (
    (submits.length === 0 && maybeSubmits.length === 0) ||
    matchable.length === 0
  ) {
    logger.debug("Incomplete form: %o", parent);
    return createForm(FormType.INCOMPLETE);
  }

  // 1. Check for form element name match
  for (const [formType, matcher] of formMatchers) {
    if (matcher.name && matchName(parent, matcher.name)) {
      logger.debug("%o name match: %s %o", formType, matcher.name, parent);
      return createMatchableForm(formType);
    }
  }

  // 2. Check for form attributes matches
  for (const [formType, matcher] of formMatchers) {
    if (matcher.attributes && matchAttributes(parent, matcher.attributes)) {
      logger.debug(
        "%o attributes match: %o %o",
        formType,
        matcher.attributes,
        parent
      );
      return createMatchableForm(formType);
    }
  }

  // 3. Check if the form fields match
  for (const [formType, matcher] of formMatchers) {
    if (matcher.fields && matchFields(inputs, matcher.fields)) {
      logger.debug("%o fields match: %o %o", formType, matcher.fields, parent);
      return createMatchableForm(formType);
    }
  }

  logger.debug("Unknown form: %o", parent);
  return createForm(FormType.UNKNOWN);
}

export function getForms(inputs: Input[]): Form[] {
  const contexts = mapInputContexts(inputs);
  const forms: Form[] = [];
  logger.group("Form identification", LogLevel.DEBUG);
  for (const context of contexts) {
    const form = parseContext(context);
    if (form.type !== FormType.INCOMPLETE) {
      let shouldAdd = true;
      for (let i = 0; i < forms.length; i++) {
        // If the form is the child of another form, replace the parent form
        // Generally parent forms should only occur when multiple different
        // forms are present on the page.
        if (forms[i].root.contains(form.root)) {
          // Insert to replace parent form, no need to add below
          forms[i] = form;
          shouldAdd = false;
          break;
        } else if (form.root.contains(forms[i].root)) {
          // Skip if form is a parent form
          shouldAdd = false;
          break;
        }
      }
      // Add the form to the list if it's not a parent form
      if (shouldAdd) forms.push(form);
    }
  }
  logger.groupEnd(LogLevel.DEBUG);
  return forms;
}
