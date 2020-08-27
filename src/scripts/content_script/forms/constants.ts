/**
 * Typed version of StoredSafe template fields.
 * The fields at the bottom are not StoredSafe fields but are used for filtering.
 */
export enum InputType {
  Username = 'username',
  Password = 'password',
  PinCode = 'pincode',
  CardNo = 'cardno',
  Expires = 'expires',
  CVC = 'cvc',

  // Fields used for filtering
  Hidden = 'hidden',
  Unknown = 'unknown'
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
  Menu = 'Menu',
  Hidden = 'Hidden',
  Unknown = 'Unknown'
}
