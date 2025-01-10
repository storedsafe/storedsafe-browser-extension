import { Logger } from "../../../global/logger";
import { InputType, FormType } from "./constants";
import type { Input } from "./inputs";
const logger = new Logger("matchers");

/**
 * Matcher for an input field.
 * @param attributes - Regular expressions matching the mapped attribute.
 * @param name - Regular expression matching the input name or id attribute.
 * */
export interface Matcher {
  attributes: Record<string, RegExp>;
  name: RegExp;
}

/**
 * Matcher for forms to determine the type of the form.
 * @param name - Regular expression matching the opening tag of the form element.
 * @param role - Regular expression matching the role attribute of the form.
 * @param fields - Mapping of matchers to number of matched elements (-1 = any)
 * */
export interface FormMatcher {
  name?: RegExp;
  attributes?: Record<string, RegExp>;
  fields?: Map<InputType, number>;
}

/**
 * Keys should match field names in StoredSafe, form inputs should only be filled
 * with the corresponding StoredSafe data if both type and name (name or id attribute)
 * get a match.
 * */
export const matchers: Map<InputType, Matcher[]> = new Map([
  [
    InputType.USERNAME,
    [
      {
        attributes: { type: /text|email/ },
        name: /user|name|mail|login|namn|id|session_key/,
      },
    ],
  ],
  [
    InputType.PASSWORD_RETYPE,
    [
      {
        attributes: { type: /password/ },
        name: /confirm|register|retype/,
      },
    ],
  ],
  [
    InputType.PASSWORD,
    [
      {
        attributes: { type: /password/ },
        name: /.*/,
      },
    ],
  ],
  [
    InputType.PINCODE,
    [
      {
        attributes: { type: /password/ },
        name: /.*/,
      },
    ],
  ],
  [
    InputType.CARDNO,
    [
      {
        attributes: { type: /text|tel/ },
        name: /card/,
      },
    ],
  ],
  [
    InputType.EXPIRES,
    [
      {
        attributes: { type: /text|tel/ },
        name: /exp/,
      },
    ],
  ],
  [
    InputType.CVC,
    [
      {
        attributes: { type: /text|tel/ },
        name: /sec|code|cvv|cvc/,
      },
    ],
  ],
  [
    InputType.SEARCH,
    [
      {
        attributes: { type: /text|search/ },
        name: /search/,
      },
    ],
  ],
]);

/**
 * Matching should be implemented in the order as follows:
 * 1. Matching the form name is considered a definite match and should return the form type.
 * 2. Matching all the form attributes is considered a definite match and should return the form type.
 * 3. Matching all the field matchers is considered a match and should return the form type.
 *
 * The formMatchers will be checked in order of appearance and the first match if any will
 * be used, meaning more generic matchers should be placed further down in the list.
 *
 * NOTE: Changed from map to multi-dimensional array to allow duplicates.
 * */
export const formMatchers: [FormType, FormMatcher][] = [
  [
    FormType.SEARCH,
    {
      name: /search/,
      attributes: { role: /search/ },
      fields: new Map([[InputType.SEARCH, -1]]),
    },
  ],
  [
    FormType.LOGIN,
    {
      name: /signin|sign-in/,
    },
  ],
  [
    FormType.REGISTER,
    {
      name: /createaccount|reg|signup/,
      fields: new Map([[InputType.PASSWORD, 2]]),
    },
  ],
  [
    FormType.REGISTER,
    {
      name: /createaccount|reg|signup/,
      fields: new Map([[InputType.PASSWORD_RETYPE, -1]]),
    },
  ],
  [
    FormType.LOGIN,
    {
      fields: new Map([
        [InputType.USERNAME, -1],
        [InputType.PASSWORD, 1],
      ]),
    },
  ],
  [
    FormType.LOGIN,
    {
      fields: new Map([
        [InputType.USERNAME, -1],
        [InputType.PINCODE, 1],
      ]),
    },
  ],
  [
    FormType.NEWSLETTER,
    {
      name: /news|letter/,
    },
  ],
  [
    FormType.MENU,
    {
      name: /nav|menu/,
    },
  ],
  [FormType.UNKNOWN, {}],
];

/**
 * Match an element against expected attribute names.
 * @param element Input element to test attributes on.
 * @param attributes HTML attributes mapped to expected values.
 */
export function matchAttributes(
  element: HTMLElement,
  attributes: Record<string, string | RegExp>
): boolean {
  if (!attributes) return false;
  for (const attribute in attributes) {
    const attributeMatcher = new RegExp(attributes[attribute], "i");
    if (!attributeMatcher.test(element.getAttribute(attribute) ?? ""))
      return false;
  }
  return true;
}

/**
 * Check if any attributes of the element matches the provided name.
 * @param element HTML element to test name on.
 * @param name Name to search for in the HTML attributes of the `input`.
 */
export function matchName(
  element: HTMLElement,
  name: string | RegExp
): boolean {
  if (!name) return false;
  const nameRegExp = new RegExp(name, "i");
  for (const attr of element.attributes) {
    if (nameRegExp.test(attr.value)) return true;
  }
  return false;
}

/**
 * Check if a form-like structure contains the types of elements described
 * in `matchers`.
 * Special count values:
 *  -2 = All
 *  -1 = Any
 * @param inputs Elements within a form-like structure.
 * @param matchers Types of elements expected to be found in `inputs`.
 */
export function matchFields(inputs: Input[], matchers: Map<InputType, number>) {
  if (!matchers) return false;
  const matches: Map<InputType, number> = new Map();
  for (const [_input, inputType] of inputs) {
    matches.set(inputType, (matches.get(inputType) ?? 0) + 1);
  }
  for (const [matcherType, matcherCount] of matchers) {
    let count = matches.get(matcherType) ?? 0;
    if (matcherCount === -2 && count !== inputs.length) return false;
    if (matcherCount === -1 && count <= 0) return false;
    if (matcherCount >= 0 && count !== matcherCount) return false;
  }
  return true;
}
