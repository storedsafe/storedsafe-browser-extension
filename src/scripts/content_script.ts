/**
 * Runs on every open tab.
 * Handles identification of forms on the webpage, tracks submission of those
 * forms and fills forms when credentials are received from another script
 * using the extension message API.
 * */
console.log('STOREDSAFE: Content script loaded')
import './inject'
// import { drawToggle, drawPopup } from './inject'
// drawToggle()

/**
 * Describes the purpose of the form. Some forms should be filled while others
 * should be ignored or handled as special cases.
 * */
enum FormType {
  Login = 'login',
  Card = 'card',
  Search = 'search',
  ContactInfo = 'contactinfo',
  NewsLetter = 'newsletter',
  Register = 'register',
  Unknown = 'unknown'
}

/**
 * Matcher for an input field.
 * @param type - Regular expression matching the input type attribute.
 * @param name - Regular expression matching the input name or id attribute.
 * */
interface Matcher {
  type: RegExp
  name: RegExp
}

/**
 * Matcher for forms to determine the type of the form.
 * @param name - Regular expression matching the name or id attribute of the form.
 * @param role - Regular expression matching the role attribute of the form.
 * @param fields - List of matchers for the input fields inside the form.
 * */
interface FormMatcher {
  name: RegExp
  role?: RegExp
  fields: Matcher[]
}

/**
 * Keys should match field names in StoredSafe, form inputs should only be filled
 * with the corresponding StoredSafe data if both type and name (name or id attribute)
 * get a match.
 * */
const matchers: Map<string, Matcher> = new Map([
  [
    'username',
    {
      type: /text|email/,
      name: /user|name|mail|login|namn|id/
    }
  ],
  [
    'password',
    {
      type: /password/,
      name: /.*/
    }
  ],
  [
    'cardno',
    {
      type: /text|tel/,
      name: /card/
    }
  ],
  [
    'expires',
    {
      type: /text|tel/,
      name: /exp/
    }
  ],
  [
    'cvc',
    {
      type: /text|tel/,
      name: /sec|code|cvv|cvc/
    }
  ]
])

/**
 * Matching the form name is considered a definite match and should return the form type.
 * Not matching a name means the fields fallback should be checked.
 * If using the fields fallback, the form should only be considered a match if all field
 * matchers find a match.
 * The formMatchers will be checked in order of appearance and the first match if any will
 * be used, meaning more generic matchers should be placed further down in the list.
 * */
const formMatchers: Map<FormType, FormMatcher> = new Map([
  [
    FormType.Search,
    {
      name: /search/,
      role: /search/,
      fields: [
        {
          type: /text|search/,
          name: /search/
        }
      ]
    }
  ],
  [
    FormType.Register,
    {
      name: /reg|signup/,
      fields: [
        {
          type: /password/,
          name: /register|retype/
        }
      ]
    }
  ],
  [
    FormType.Login,
    {
      name: /login|signin|sign-in/,
      fields: [matchers.get('username'), matchers.get('password')]
    }
  ],
  [
    FormType.NewsLetter,
    {
      name: /news|letter/,
      fields: []
    }
  ]
])

/**
 * Checks whether an element is of a type that is fillable by the user.
 * @param element Element to be tested.
 * @returns True if the element is an input that can be filled by the user.
 * */
function isElementFillable (element: Element): boolean {
  return (
    element instanceof HTMLInputElement &&
    !['hidden', 'button', 'submit', 'reset'].includes(element.type)
  )
}

/**
 * Checks whether a field is a match for the provded input field.
 * @param field - Name of StoredSafe field.
 * @param element - Input element to attempt a match with.
 * @returns True if the element is a match for the field.
 * */
function isMatch (field: string, element: HTMLInputElement): boolean {
  if (matchers.get(field) === undefined) return false
  const types = new RegExp(matchers.get(field).type, 'i')
  const name = new RegExp(matchers.get(field).name, 'i')
  return (
    types.test(element.type) &&
    (name.test(element.name) || name.test(element.id))
  )
}

/**
 * Checks a form against the form matchers to determine the type of the form.
 * @param form - The form to be matched.
 * @returns The type indicating the purpose of the form.
 * */
function getFormType (form: HTMLFormElement): FormType {
  for (const [formType, formTypeMatchers] of formMatchers) {
    // Check for form name or id match
    const name = new RegExp(formTypeMatchers.name, 'i')
    if (
      name.test(form.id) ||
      name.test(form.name) ||
      name.test(form.className)
    ) {
      return formType
    }

    // Check for form role
    const formRole = form.attributes.getNamedItem('role')
    if (formTypeMatchers.role !== undefined && formRole !== undefined) {
      const role = new RegExp(formTypeMatchers.role, 'i')
      if (role.test(formRole?.value)) {
        return formType
      }
    }

    // Check for fields match
    let match = formTypeMatchers.fields.length !== 0
    for (let i = 0; i < formTypeMatchers.fields.length; i++) {
      const fieldName = new RegExp(formTypeMatchers.fields[i].name, 'i')
      const fieldType = new RegExp(formTypeMatchers.fields[i].type, 'i')
      let fieldMatch = false
      for (let j = 0; j < form.length; j++) {
        const element = form[j]
        if (
          element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement ||
          element instanceof HTMLSelectElement
        ) {
          if (
            fieldType.test(element.type) &&
            (fieldName.test(element.id) || fieldName.test(element.name))
          ) {
            fieldMatch = true
          }
        }
      }
      // Overall match only if all fields find a matching element.
      match = match && fieldMatch
    }
    if (match) return formType
  }
  return FormType.Unknown
}

/**
 * Form types that should be filled by the extension.
 * */
const fillFormTypes: FormType[] = [FormType.Login, FormType.Card]

/**
 * Form types that should be saved by the extension when the form is submitted.
 * */
const saveFormTypes: FormType[] = [FormType.Login, FormType.Register]

let fillForms: HTMLFormElement[] = []
/**
 * Scan the webpage for forms and identify the types of those forms.
 * If any fillable forms are found, send a message to the background script to
 * perform a search.
 * If any forms are of a type where we want to save the data they submit, set
 * up an event handler to send the data to the background script when submitted.
 * */
function scanPage (): void {
  const { forms } = document
  fillForms = []
  for (let i = 0; i < forms.length; i++) {
    const formType = getFormType(forms[i])
    // TODO: Remove log statement
    console.log('STOREDSAFE: Found form ', forms[i], formType)
    if (fillFormTypes.includes(formType)) {
      fillForms.push(forms[i])
    }
    if (saveFormTypes.includes(formType)) {
      forms[i].addEventListener('submit', event => {
        const values: Record<string, string> = {}
        const target = event.target as HTMLFormElement
        for (const [field] of matchers) {
          for (let i = 0; i < target.length; i++) {
            const element = target[i]
            if (
              element instanceof HTMLInputElement &&
              isMatch(field, element)
            ) {
              values[field] = element.value
            }
          }
        }
        browser.runtime
          .sendMessage({
            type: 'submit',
            data: values
          })
          .catch(error => console.error(error))
      })
    }
  }

  if (fillForms.length > 0) {
    browser.runtime
      .sendMessage({
        type: 'tabSearch'
      })
      .catch(error => console.error(error))
  }
}

// Scan page when the content script is loaded.
scanPage()

// Observe changes in the webpage in case there are forms that are not rendered
// when the DOM is first loaded.
// TODO: Fix looping when other extensions change the form
const observer = new MutationObserver(mutation => {
  for (const { addedNodes } of mutation) {
    for (const node of addedNodes) {
      if (node instanceof Element && node.querySelector('form') !== null) {
        // TODO: Remove log statement
        console.log('STOREDSAFE: Site DOM updated, scan again.')
        scanPage()
      }
    }
  }
})
observer.observe(document.body, { childList: true, subtree: true })

/**
 * Mapping of StoredSafe field names to StoredSafe values.
 * */
type Data = Array<[string, string]>

/**
 * Fill input fields with StoredSafe data in the appropriate forms/fields.
 * @param data - StoredSafe data.
 * @param submit - Whether or not to submit the form after filling it.
 * */
function fillForm (data: Data, submit = false): void {
  for (const form of fillForms) {
    let filled = false
    for (const element of form) {
      if (element instanceof HTMLInputElement && isElementFillable(element)) {
        let elementFilled = false
        for (const [field, value] of new Map(data)) {
          if (isMatch(field, element)) {
            elementFilled = true
            filled = true
            element.value = value
            // Manually trigger change event after value change for sites depending on this
            element.dispatchEvent(new Event('change', { bubbles: true }))
            break
          }
        }
        if (!elementFilled) {
          // If no field matched this element
          element.focus() // Focus element for easier access (example otp field)
        }
      }
    }
    if (filled && submit) {
      // fillForms[i].submit(); // TODO: Fix compatibility with autofill on failed login.
    }
  }
}

/**
 * The type of messages the content script expects to receive.
 * @param type - The type of the message, contract between sender and receiver.
 * @param data - StoredSafe data.
 * */
interface Message {
  type: string
  data: Data
}

/**
 * Handle messages sent to the tab by other scripts.
 * @param message - Message sent by other script.
 * */
function onMessage (message: Message): void {
  if (message.type === 'fill') {
    fillForm(message.data)
  }
}

// Set up listener for messages from other scripts within the extension.
browser.runtime.onMessage.addListener(onMessage)
