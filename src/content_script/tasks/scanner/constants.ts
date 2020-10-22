/**
 * Typed version of StoredSafe template fields.
 * The fields at the bottom are not StoredSafe fields but are used for filtering.
 */
export enum InputType {
  USERNAME = 'username',
  PASSWORD = 'password',
  PINCODE = 'pincode',
  CARDNO = 'cardno',
  EXPIRES = 'expires',
  CVC = 'cvc',

  // Fields that need special handling, for example filtering
  HIDDEN = 'hidden',
  UNKNOWN = 'unknown',
  SEARCH = 'search',
  SUBMIT = 'submit',
  RESET = 'reset',
  MAYBE_SUBMIT = 'maybe_submit', // Potential submit
  DISCARD = 'discard', // False positive, discard

  // Special cases, dot separated <StoredSafe Field Name>.<Unique Identifier>
  // Interpreted as whatever is before the dot when filling
  PASSWORD_RETYPE = 'password.retype'
}

/**
 * Describes the purpose of the form. Some forms should be filled while others
 * should be ignored or handled as special cases.
 * */
export enum FormType {
  LOGIN = 'Login',
  CARD = 'Card',
  SEARCH = 'Search',
  CONTACTINFO = 'Contactinfo',
  NEWSLETTER = 'Newsletter',
  REGISTER = 'Register',
  MENU = 'Menu',
  HIDDEN = 'Hidden',
  INCOMPLETE = 'Incomplete',
  UNKNOWN = 'Unknown',
}

export const INPUT_FILL_TYPES = [
  InputType.USERNAME,
  InputType.PASSWORD,
  InputType.PINCODE,
  InputType.CARDNO,
  InputType.EXPIRES,
  InputType.CVC,
  InputType.PASSWORD_RETYPE
]

export const FORM_FILL_TYPES = [FormType.LOGIN]
export const FORM_SAVE_TYPES = [FormType.LOGIN, FormType.REGISTER]
