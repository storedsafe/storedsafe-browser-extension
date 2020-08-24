import { FormValues, Forms } from './PageScanner'
import { formMatchers, FormType, Matcher } from './matchers'
import { logger as formsLogger } from '.'
import Logger from '../../../utils/Logger'

const logger = new Logger('Parser', formsLogger)

////////////////////////////////////////////////////////////
// HELPER FUNCTIONS

/**
 * Has at least one submit element.
 */
const hasSubmit = ({ submitElements }: FormValues) => submitElements.length > 0

/**
 * All input fields are of the hidden type.
 */
const isHidden = ({ inputElements }: FormValues) =>
  inputElements.reduce(
    (isHidden, inputElement) => isHidden && inputElement.type === 'hidden',
    true
  )

/**
 * Test a name against the opening tag of an element.
 * @param element Element to test for presence of name.
 * @param name Name to be matched against element.
 */
export const matchName = (
  element: HTMLElement,
  name: string | RegExp
): boolean => {
  const nameRegExp = new RegExp(name, 'i')
  return nameRegExp.test(element.outerHTML.match(/(<[^>]*>)/)?.[0]) // Only match opening tag
}

/**
 * Test an element for the presence of attribute values.
 * @param element Element to test for presence of attribute values.
 * @param attributeMatchers Mapping from attribute to matcher.
 */
const matchAttributes = (
  element: HTMLElement,
  attributeMatchers: Record<string, string | RegExp>
) => {
  for (const attribute in attributeMatchers) {
    const attributeMatcher = new RegExp(attributeMatchers[attribute], 'i')
    if (!attributeMatcher.test(element.getAttribute(attribute))) return false
  }
  return true
}

/**
 * Test whether an input field is of a specific type.
 * @param input Input element to be tested.
 * @param matcher Type to be tested against.
 */
const isFieldType = (input: HTMLInputElement, matcher: Matcher): boolean => {
  const { attributes: attributeMatchers, name: nameMatcher } = matcher
  return (
    matchAttributes(input, attributeMatchers) && matchName(input, nameMatcher)
  )
}

/**
 * Count the amount of elements matching the specified field type.
 * @param inputElements Collection of input elements to be tested.
 * @param matcher Type to be tested against.
 */
const countFieldType = (
  inputElements: HTMLInputElement[],
  matcher: Matcher
): number =>
  inputElements.reduce(
    (acc, input) => acc + (isFieldType(input, matcher) ? 1 : 0),
    0
  )

/**
 * Test whether at least one of the provided input elements is of a specific type.
 * @param inputElements Collection of input elements to be tested.
 * @param matcher Type to be tested against.
 */
const hasFieldType = (
  inputElements: HTMLInputElement[],
  matcher: Matcher
): boolean => countFieldType(inputElements, matcher) !== 0

const matchFields = (
  { inputElements }: FormValues,
  fieldMatchers: Map<Matcher, number>
) => {
  for (const [matcher, count] of fieldMatchers) {
    // Count = -1 means one or more matches
    if (
      (count === -1 && !hasFieldType(inputElements, matcher)) ||
      (count !== -1 && countFieldType(inputElements, matcher) !== count)
    ) {
      return false
    }
  }
  return true
}

////////////////////////////////////////////////////////////
// FORM TYPE MATCHER

export const parseForms = (forms: Forms): Forms => {
  for (const [form, formValues] of forms) {
    // Cull hidden forms as they're not made for user interaction.
    if (isHidden(formValues)) {
      forms.delete(form)
      continue
    }

    // Forms without submits are regarded as unknown as they can't be
    // submitted by a user. These forms may be caught in the second pass
    // when the search is extended beyond button types.
    if (!hasSubmit(formValues)) {
      continue // Default form type unknown
    }

    // 1. Check for form element name matches
    for (const [formType, formMatcher] of formMatchers) {
      if (formMatcher.name === undefined) continue
      if (matchName(form, formMatcher.name)) {
        formValues.type = formType
        break
      }
    }
    if (formValues.type !== FormType.Unknown) continue

    // 2. Check for form attributes matches
    for (const [formType, formMatcher] of formMatchers) {
      if (formMatcher.attributes === undefined) continue
      if (matchAttributes(form, formMatcher.attributes)) {
        formValues.type = formType
        break
      }
    }
    if (formValues.type !== FormType.Unknown) continue

    // 3. Check if the form fields match
    for (const [formType, formMatcher] of formMatchers) {
      if (formMatcher.fields === undefined) continue
      if (matchFields(formValues, formMatcher.fields)) {
        formValues.type = formType
        break
      }
    }
    if (formValues.type !== FormType.Unknown) continue

    // 4. No matches found
    formValues.type = FormType.Unknown
    // TODO: Remove log statement
    logger.debug('Unknown form %o', form, formValues)
  }
  return forms
}