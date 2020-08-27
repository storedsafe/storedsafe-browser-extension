import { logger as formsLogger } from '.'
import Logger from '../../../utils/Logger'
import { InputType, FormType } from './constants'
const logger = new Logger('Matchers', formsLogger)

/**
 * Matcher for an input field.
 * @param attributes - Regular expressions matching the mapped attribute.
 * @param name - Regular expression matching the input name or id attribute.
 * */
interface Matcher {
  attributes: Record<string, RegExp>
  name: RegExp
}

/**
 * Matcher for forms to determine the type of the form.
 * @param name - Regular expression matching the opening tag of the form element.
 * @param role - Regular expression matching the role attribute of the form.
 * @param fields - Mapping of matchers to number of matched elements (-1 = any)
 * */
interface FormMatcher {
  name?: RegExp
  attributes?: Record<string, RegExp>
  fields?: Map<Matcher[], number>
}

/**
 * Keys should match field names in StoredSafe, form inputs should only be filled
 * with the corresponding StoredSafe data if both type and name (name or id attribute)
 * get a match.
 * */
const matchers: Map<InputType, Matcher[]> = new Map([
  [
    InputType.Username,
    [
      {
        attributes: { type: /text|email/ },
        name: /user|name|mail|login|namn|id|session_key/
      }
    ]
  ],
  [
    InputType.Password,
    [
      {
        attributes: { type: /password/ },
        name: /.*/
      }
    ]
  ],
  [
    InputType.PinCode,
    [
      {
        attributes: { type: /password/ },
        name: /.*/
      }
    ]
  ],
  [
    InputType.CardNo,
    [
      {
        attributes: { type: /text|tel/ },
        name: /card/
      }
    ]
  ],
  [
    InputType.Expires,
    [
      {
        attributes: { type: /text|tel/ },
        name: /exp/
      }
    ]
  ],
  [
    InputType.CVC,
    [
      {
        attributes: { type: /text|tel/ },
        name: /sec|code|cvv|cvc/
      }
    ]
  ]
])

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
const formMatchers: [FormType, FormMatcher][] = [
  [
    FormType.Search,
    {
      name: /search/,
      attributes: { role: /search/ },
      fields: new Map([
        [
          [
            {
              attributes: { type: /text|search/ },
              name: /search/
            }
          ],
          -1
        ]
      ])
    }
  ],
  [
    FormType.Login,
    {
      name: /signin|sign-in/
    }
  ],
  [
    FormType.Register,
    {
      name: /createaccount|reg|signup/,
      fields: new Map([
        [
          [
            {
              attributes: { type: /password/ },
              name: /.*/
            }
          ],
          2
        ],
        [
          [
            {
              attributes: { type: /password/ },
              name: /confirm|register|retype/
            }
          ],
          -1
        ]
      ])
    }
  ],
  [
    FormType.Login,
    {
      fields: new Map([
        [matchers.get(InputType.Username), -1],
        [matchers.get(InputType.Password), 1]
      ])
    }
  ],
  [
    FormType.Login,
    {
      fields: new Map([
        [matchers.get(InputType.Username), -1],
        [matchers.get(InputType.PinCode), 1]
      ])
    }
  ],
  [
    FormType.NewsLetter,
    {
      name: /news|letter/
    }
  ],
  [
    FormType.Menu,
    {
      name: /nav|menu/
    }
  ],
  [FormType.Unknown, {}]
]

/**
 * Form types that should be filled by the extension.
 * */
const fillFormTypes: FormType[] = [FormType.Login, FormType.Card]

/**
 * Form types that should be saved by the extension when the form is submitted.
 * */
const saveFormTypes: FormType[] = [FormType.Login, FormType.Register]

////////////////////////////////////////////////////////////
// Start matching helper functions

/**
 * All input fields are of the hidden type.
 */
const isHidden = (element: HTMLInputElement): boolean => (
  element.type === 'hidden' || element.hidden === true
)

const isHiddenForm = (inputElements: HTMLInputElement[]) =>
  inputElements.reduce(
    (hidden, inputElement) => hidden && isHidden(inputElement),
    true
  )

/**
 * Test a name against the opening tag of an element.
 * @param element Element to test for presence of name.
 * @param name Name to be matched against element.
 */
export function matchName (element: HTMLElement, name: string | RegExp): boolean {
  const nameRegExp = new RegExp(name, 'i')
  return nameRegExp.test((element.outerHTML.match(/(<[^>]*>)/)?.[0])) // Only match opening tag
}

/**
 * Test an element for the presence of attribute values.
 * @param element Element to test for presence of attribute values.
 * @param attributeMatchers Mapping from attribute to matcher.
 */
function matchAttributes (
  element: HTMLElement,
  attributeMatchers: Record<string, string | RegExp>
): boolean {
  for (const attribute in attributeMatchers) {
    const attributeMatcher = new RegExp(attributeMatchers[attribute], 'i')
    if (!attributeMatcher.test(element.getAttribute(attribute))) return false
  }
  return true
}

/**
 * Test the types of a group of input elements against a list of matchers.
 * If the amount of matches is the same as the matchCount parameter,
 * the function should return true. Negative numbers are used for special cases
 * where -1 will return true if there is any match and -2 will return true only
 * if all elements match.
 *
 * NOTE: This is separate from regular input matching because form identification
 * sometimes requires more specific matchers to differentiate for example a register
 * password field from a login password field, whereas the regular input matchers are
 * only relevant when filling StoredSafe data to know which data goes into which field.
 * @param inputTypes List of the types of all inputs.
 * @param matchers List of expressions considered to be a match.
 * @param matchCount Desired number of matches (-1 = Any, -2 = All)
 */
function matchField (
  inputs: HTMLInputElement[],
  matchers: Matcher[],
  matchCount = -1
): boolean {
  let count = 0
  for (const input of inputs) {
    let isMatch = false
    for (const matcher of matchers) {
      isMatch = matchName(input, matcher.name) && matchAttributes(input, matcher.attributes)
    }
    if (isMatch) count++
  }
  if (matchCount === -2) {
    return count === inputs.length
  } else if (matchCount === -1) {
    return count > 0
  } else if (matchCount >= 0) {
    return count === matchCount
  }
  return false
}

function matchFields(inputs: HTMLInputElement[], fieldMatchers: Map<Matcher[], number>): boolean {
  for (const [matchers, matchCount] of fieldMatchers) {
    if (!matchField(inputs, matchers, matchCount)) return false
  }
  return true
}

export function getInputType (input: HTMLInputElement): InputType {
  if (isHidden(input)) return InputType.Hidden
  for (const [inputType, inputMatchers] of matchers) {
    for (const matcher of inputMatchers) {
      if (
        matchName(input, matcher.name) &&
        matchAttributes(input, matcher.attributes)
      )
        return inputType
    }
  }
  return InputType.Unknown
}

export function getFormType (
  element: HTMLElement,
  inputElements: HTMLInputElement[],
  submitElements: HTMLElement[]
): FormType {
  // Cull hidden forms as they're not made for user interaction.
  if (isHiddenForm(inputElements)) return FormType.Hidden

  // Forms without submits are regarded as unknown as they can't be
  // submitted by a user. These forms may be caught in the second pass
  // when the search is extended beyond button types.
  if (submitElements.length === 0) return FormType.Unknown

  // 1. Check for form element name matches
  for (const [formType, formMatcher] of formMatchers) {
    if (formMatcher.name === undefined) continue
    if (matchName(element, formMatcher.name)) {
      logger.debug('Identified form %o as %s by name', element, formType)
      return formType
    }
  }

  // 2. Check for form attributes matches
  for (const [formType, formMatcher] of formMatchers) {
    if (formMatcher.attributes === undefined) continue
    if (matchAttributes(element, formMatcher.attributes)) {
      logger.debug('Identified form %o as %s by attributes', element, formType)
      return formType
    }
  }

  // 3. Check if the form fields match
  for (const [formType, formMatcher] of formMatchers) {
    if (formMatcher.fields === undefined) continue
    if (matchFields(inputElements, formMatcher.fields)) {
      logger.debug('Identified form %o as %s by fields', element, formType)
      return formType
    }
  }

  return FormType.Unknown
}

export const FILL_TYPES = [FormType.Login]
export const SAVE_TYPES = [FormType.Login, FormType.Register]
