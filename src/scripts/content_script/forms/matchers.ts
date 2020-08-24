/**
 * Typed version of StoredSafe template fields.
 */
export enum FieldType {
  USERNAME = 'username',
  PASSWORD = 'password',
  PINCODE = 'pincode',
  CARD_NO = 'cardno',
  EXPIRES = 'expires',
  CVC = 'cvc'
}

/**
 * Describes the purpose of the form. Some forms should be filled while others
 * should be ignored or handled as special cases.
 * */
export enum FormType {
  Login = 'Login',
  Card = 'Card',
  Search = 'Search',
  ContactInfo = 'Contactinfo',
  NewsLetter = 'Newsletter',
  Register = 'Register',
  Unknown = 'Unknown',
  Menu = 'Menu'
}

/**
 * Matcher for an input field.
 * @param attributes - Regular expressions matching the mapped attribute.
 * @param name - Regular expression matching the input name or id attribute.
 * */
export interface Matcher {
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
  fields?: Map<Matcher, number>
}

/**
 * Keys should match field names in StoredSafe, form inputs should only be filled
 * with the corresponding StoredSafe data if both type and name (name or id attribute)
 * get a match.
 * */
export const matchers: Map<string, Matcher> = new Map([
  [
    FieldType.USERNAME,
    {
      attributes: { type: /text|email/ },
      name: /user|name|mail|login|namn|id|session_key/
    }
  ],
  [
    FieldType.PASSWORD,
    {
      attributes: { type: /password/ },
      name: /.*/
    }
  ],
  [
    FieldType.PINCODE,
    {
      attributes: { type: /password/ },
      name: /.*/
    }
  ],
  [
    FieldType.CARD_NO,
    {
      attributes: { type: /text|tel/ },
      name: /card/
    }
  ],
  [
    FieldType.EXPIRES,
    {
      attributes: { type: /text|tel/ },
      name: /exp/
    }
  ],
  [
    FieldType.CVC,
    {
      attributes: { type: /text|tel/ },
      name: /sec|code|cvv|cvc/
    }
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
 * */
export const formMatchers: [FormType, FormMatcher][] = [
  [
    FormType.Search,
    {
      name: /search/,
      attributes: { role: /search/ },
      fields: new Map([
        [
          {
            attributes: { type: /text|search/ },
            name: /search/
          },
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
          {
            attributes: { type: /password/ },
            name: /.*/
          },
          2
        ],
        [
          {
            attributes: { type: /password/ },
            name: /confirm|register|retype/
          },
          -1
        ]
      ])
    }
  ],
  [
    FormType.Login,
    {
      fields: new Map([
        [matchers.get(FieldType.USERNAME), -1],
        [matchers.get(FieldType.PASSWORD), 1]
      ])
    }
  ],
  [
    FormType.Login,
    {
      fields: new Map([
        [matchers.get(FieldType.USERNAME), -1],
        [matchers.get(FieldType.PINCODE), 1]
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

// TODO: Refactor old code
function isMatch (field: string, element: HTMLInputElement) {
  return true
}

function onSubmit () {
  const values: Record<string, string> = {}
  const target = event.target as HTMLFormElement
  for (const [field] of matchers) {
    for (let i = 0; i < target.length; i++) {
      const element = target[i]
      if (element instanceof HTMLInputElement && isMatch(field, element)) {
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
}

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
 * Fill input fields with StoredSafe data in the appropriate forms/fields.
 * @param data - StoredSafe data.
 * @param submit - Whether or not to submit the form after filling it.
 * */
function fillForm (data: [string, string][], submit = false): void {
  for (const form of [] as HTMLFormElement[]) {
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
