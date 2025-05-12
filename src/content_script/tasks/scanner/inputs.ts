import { Logger, LogLevel } from "@/global/logger";
import { InputType } from "./constants";
import type { Matcher } from "./matchers";
import { matchAttributes, matchers, matchName } from "./matchers";

export interface Input {
  element: HTMLElement;
  type: InputType;
}

const logger = new Logger("input", true);

export const INPUT_SELECTORS: string = [
  "input",
  "button",
  "a",
  // Leaving selectors below for reference in case they should be needed in the future.
  // 'select',
  // 'textarea'
].join(", ");

/**
 * Check if the HTML attributes of the input element correspond to the provided matcher.
 * @param input Input element to test against matcher.
 * @param matcher Rules determining whether or not the element is considered a match.
 */
function isMatch(input: HTMLInputElement, matcher: Matcher): boolean {
  return (
    matchName(input, matcher.name) && matchAttributes(input, matcher.attributes)
  );
}

function getOpeningTag(element: HTMLElement): string {
  return element.outerHTML.match(/(<[^>]*>)/)?.[0] || "";
}

/**
 * Test the contents of an element against submit identifiers when
 * the type of the element isn't enough to determine that it is a submit button.
 * "Maybe Submit" elements are used as a fallback when no definite submit elements
 * are found.
 * @param element HTML element to test for submit identifiers.
 */
function testMaybeSubmit(element: HTMLElement): boolean {
  return /login|sign|submit/.test(getOpeningTag(element) + element.innerText);
}

/**
 * Determine the type of the element according to the application's matchers.
 * The type of the element determines how the element should be treated later on.
 *
 * Types may be reclassified in other parts of the program if the context they're in
 * suggests another type is more appropriate. For example a form with no submit that has
 * a button type may in fact have a misconfigured button element which should be considered
 * as a submit type.
 * @param element HTML element to be classified.
 */
function getElementType(element: HTMLElement): InputType {
  // There are only three types of buttons, easier as special case
  if (element instanceof HTMLButtonElement) {
    if (element.type === "submit") {
      logger.debug("Submit button: %o", element);
      return InputType.SUBMIT;
    }
    if (element.type === "button" && testMaybeSubmit(element)) {
      logger.debug("Maybe submit button: %o", element);
      return InputType.MAYBE_SUBMIT;
    }
    logger.debug("Discarding button: %o", element);
    return InputType.DISCARD;
  }

  // Links are sometimes used as submit elements.
  // Can be reclassified based on context.
  if (element instanceof HTMLAnchorElement) {
    if (testMaybeSubmit(element)) {
      logger.debug("Maybe submit link: %o", element);
      return InputType.MAYBE_SUBMIT;
    }
    logger.debug("Discarding link: %o", element);
    return InputType.DISCARD;
  }

  // Handle input elements
  if (element instanceof HTMLInputElement) {
    // Handle simple type-based matchers as a special case
    if (element.type.match(/submit|image/i)) {
      logger.debug("Submit input: %o", element);
      return InputType.SUBMIT;
    }
    if (element.type === "hidden") {
      logger.debug("Hidden input: %o", element);
      return InputType.HIDDEN;
    }

    // Go through application matchers
    for (const [inputType, inputMatchers] of matchers) {
      for (const matcher of inputMatchers) {
        if (isMatch(element, matcher)) {
          logger.debug("%o input: %o", inputType, element);
          return inputType;
        }
      }
    }
  }

  // Fallback if no matching type is found
  logger.debug("Unknown input: %o", element);
  return InputType.UNKNOWN;
}

/**
 * Get and classify all elements that are relevant to the scan process.
 * @param root Root element to start search from.
 */
export function getInputs(root: HTMLElement = document.body): Input[] {
  const inputs: Input[] = [];

  logger.group("Input identification", LogLevel.DEBUG);
  // Classify all relevant elements under the root node.
  const elements = root.querySelectorAll<HTMLElement>(INPUT_SELECTORS);
  for (const element of elements) {
    inputs.push({ element, type: getElementType(element) });
  }
  logger.groupEnd(LogLevel.DEBUG);
  return inputs.filter((input) => input.type !== InputType.DISCARD);
}
