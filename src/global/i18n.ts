/**
 * Identifiers for localized messages.
 * @see /public/_locales
 */
export enum LocalizedMessage {
  EXTENSION_NAME = 'EXTENSION_NAME',

  // Welcome
  WELCOME_MESSAGE_TITLE = 'WELCOME_MESSAGE_TITLE',
  WELCOME_MESSAGE_DESCRIPTION = 'WELCOME_MESSAGE_DESCRIPTION',
  WELCOME_MESSAGE_PLUG = 'WELCOME_MESSAGE_PLUG',

  // Search
  SEARCH_PLACEHOLDER = 'SEARCH_PLACEHOLDER',
  SEARCH_EMPTY = 'SEARCH_EMPTY',
  SEARCH_ARIA_LABEL_NEEDLE = 'SEARCH_ARIA_LABEL_NEEDLE',
  SEARCH_ARIA_LABEL_SUBMIT = 'SEARCH_ARIA_LABEL_SUBMIT',
  SEARCH_RESULT_CANCEL_EDIT = 'SEARCH_RESULT_CANCEL_EDIT',
  SEARCH_RESULT_FILL = 'SEARCH_RESULT_FILL',
  SEARCH_RESULT_SAVE = 'SEARCH_RESULT_SAVE',
  SEARCH_RESULT_EDIT = 'SEARCH_RESULT_EDIT',
  SEARCH_RESULT_DELETE = 'SEARCH_RESULT_DELETE',
  SEARCH_RESULT_CONFIRM_DELETE = 'SEARCH_RESULT_CONFIRM_DELETE',
  SEARCH_ERROR = 'SEARCH_ERROR',

  // Menu
  MENU_ADD = 'MENU_ADD',
  MENU_SESSIONS = 'MENU_SESSIONS',
  MENU_GENERATE_PASSWORD = 'MENU_GENERATE_PASSWORD',
  MENU_OPTIONS = 'MENU_OPTIONS',

  // Add
  ADD_HOST = 'ADD_HOST',
  ADD_VAULT = 'ADD_VAULT',
  ADD_TEMPLATE = 'ADD_TEMPLATE',
  ADD_CREATE = 'ADD_CREATE',
  ADD_EDIT = 'ADD_EDIT',
  ADD_SUCCESS = 'ADD_SUCCESS',

  // Loading
  LOADING_TITLE = 'LOADING_TITLE',

  // Sessions
  SESSIONS_LOGIN_TYPE = 'SESSIONS_LOGIN_TYPE',
  SESSIONS_LOGIN_TYPE_TOTP = 'SESSIONS_LOGIN_TYPE_TOTP',
  SESSIONS_LOGIN_TYPE_YUBIKEY = 'SESSIONS_LOGIN_TYPE_YUBIKEY',
  SESSIONS_USERNAME = 'SESSIONS_USERNAME',
  SESSIONS_PASSPHRASE = 'SESSIONS_PASSPHRASE',
  SESSIONS_OTP = 'SESSIONS_OTP',
  SESSIONS_KEYS = 'SESSIONS_KEYS',
  SESSIONS_LOGIN = 'SESSIONS_LOGIN',
  SESSIONS_LOGOUT = 'SESSIONS_LOGOUT',
  SESSIONS_REMEMBER = 'SESSIONS_REMEMBER',
  SESSIONS_ONLINE = 'SESSIONS_ONLINE',
  SESSIONS_OFFLINE = 'SESSIONS_OFFLINE',
  SESSIONS_WARNINGS_ICON_TITLE = 'SESSIONS_WARNINGS_ICON_TITLE',
  SESSIONS_VIOLATIONS_ICON_TITLE = 'SESSIONS_VIOLATIONS_ICON_TITLE',
  SESSIONS_STATUS = 'SESSIONS_STATUS',
  SESSIONS_WARNINGS = 'SESSIONS_WARNINGS',
  SESSIONS_VIOLATIONS = 'SESSIONS_VIOLATIONS',
  SESSIONS_ONLINE_SINCE = 'SESSIONS_ONLINE_SINCE',
  SESSIONS_GOTO = 'SESSIONS_GOTO',

  // Messages
  MESSAGES_MORE = 'MESSAGES_MORE',
  MESSAGES_ONE_MORE = 'MESSAGES_ONE_MORE',
  MESSAGES_CLEAR = 'MESSAGES_CLEAR',

  // Images
  IMG_LOGO_ALT = 'IMG_LOGO_ALT',

  // Password verification errors
  PASSWORD_MATCH_POLICY = 'PASSWORD_MATCH_POLICY',
  PASSWORD_MIN_LENGTH_ERROR = 'PASSWORD_MIN_LENGTH_ERROR',
  PASSWORD_MAX_LENGTH_ERROR = 'PASSWORD_MAX_LENGTH_ERROR',
  PASSWORD_MIN_LOWERCASE_CHARS_ERROR = 'PASSWORD_MIN_LOWERCASE_CHARS_ERROR',
  PASSWORD_MAX_LOWERCASE_CHARS_ERROR = 'PASSWORD_MAX_LOWERCASE_CHARS_ERROR',
  PASSWORD_MIN_UPPERCASE_CHARS_ERROR = 'PASSWORD_MIN_UPPERCASE_CHARS_ERROR',
  PASSWORD_MAX_UPPERCASE_CHARS_ERROR = 'PASSWORD_MAX_UPPERCASE_CHARS_ERROR',
  PASSWORD_DISALLOW_NUMERIC_CHARS_ERROR = 'PASSWORD_DISALLOW_NUMERIC_CHARS_ERROR',
  PASSWORD_DISALLOW_NUMERIC_FIRST_ERROR = 'PASSWORD_DISALLOW_NUMERIC_FIRST_ERROR',
  PASSWORD_DISALLOW_NUMERIC_LAST_ERROR = 'PASSWORD_DISALLOW_NUMERIC_LAST_ERROR',
  PASSWORD_MIN_NUMERIC_CHARS_ERROR = 'PASSWORD_MIN_NUMERIC_CHARS_ERROR',
  PASSWORD_MAX_NUMERIC_CHARS_ERROR = 'PASSWORD_MAX_NUMERIC_CHARS_ERROR',
  PASSWORD_DISALLOW_NONALPHANUMERIC_CHARS_ERROR = 'PASSWORD_DISALLOW_NONALPHANUMERIC_CHARS_ERROR',
  PASSWORD_DISALLOW_NONALPHANUMERIC_FIRST_ERROR = 'PASSWORD_DISALLOW_NONALPHANUMERIC_FIRST_ERROR',
  PASSWORD_DISALLOW_NONALPHANUMERIC_LAST_ERROR = 'PASSWORD_DISALLOW_NONALPHANUMERIC_LAST_ERROR',
  PASSWORD_MIN_NONALPHANUMERIC_CHARS_ERROR = 'PASSWORD_MIN_NONALPHANUMERIC_CHARS_ERROR',
  PASSWORD_MAX_NONALPHANUMERIC_CHARS_ERROR = 'PASSWORD_MAX_NONALPHANUMERIC_CHARS_ERROR',

  // Confirm Dialog
  CONFIRM_DIALOG_YES = 'CONFIRM_DIALOG_YES',
  CONFIRM_DIALOG_NO = 'CONFIRM_DIALOG_NO',

  // Result
  RESULT_COPY = 'RESULT_COPY',
  RESULT_LOGIN = 'RESULT_LOGIN',
  RESULT_SHOW = 'RESULT_SHOW',
  RESULT_HIDE = 'RESULT_HIDE',
  RESULT_LARGE = 'RESULT_LARGE',
  RESULT_SMALL = 'RESULT_SMALL',

  // General Settings
  SETTINGS_AUTO_FILL_LABEL = 'SETTINGS_AUTO_FILL_LABEL',
  SETTINGS_AUTO_FILL_TITLE = 'SETTINGS_AUTO_FILL_TITLE',
  SETTINGS_IDLE_MAX_LABEL = 'SETTINGS_IDLE_MAX_LABEL',
  SETTINGS_MAX_TOKEN_LIFE_LABEL = 'SETTINGS_MAX_TOKEN_LIFE_LABEL',
  SETTINGS_UNIT_MINUTES = 'SETTINGS_UNIT_MINUTES',
  SETTINGS_UNIT_HOURS = 'SETTINGS_UNIT_HOURS',
  SETTINGS_OFFER_SAVE_LABEL = "SETTINGS_OFFER_SAVE_LABEL",
  SETTINGS_OFFER_SAVE_TITLE = "SETTINGS_OFFER_SAVE_TITLE",

  SETTINGS_USER_HEADER = 'SETTINGS_USER_HEADER',
  SETTINGS_USER_TITLE = 'SETTINGS_USER_TITLE',
  SETTINGS_USER_UPDATE = 'SETTINGS_USER_UPDATE',
  SETTINGS_USER_ALL_LOCKED = 'SETTINGS_USER_ALL_LOCKED',
  SETTINGS_MANAGED_HEADER = 'SETTINGS_MANAGED_HEADER',
  SETTINGS_MANAGED_TITLE = 'SETTINGS_MANAGED_TITLE',
  SETTINGS_MANAGED_TRUE = 'SETTINGS_MANAGED_TRUE',
  SETTINGS_MANAGED_FALSE = 'SETTINGS_MANAGED_FALSE',

  // Loading
  LOADING_UNKNOWN_ERROR = 'LOADING_UNKNOWN_ERROR',

  // Site options
  OPTIONS_SITES_ADD_HEADER = 'OPTIONS_SITES_ADD_HEADER',
  OPTIONS_SITES_ADD_LABEL_HOST = 'OPTIONS_SITES_ADD_LABEL_HOST',
  OPTIONS_SITES_ADD_LABEL_APIKEY = 'OPTIONS_SITES_ADD_LABEL_APIKEY',
  OPTIONS_SITES_ADD = 'OPTIONS_SITES_ADD',
  OPTIONS_SITES_USER_TITLE = 'OPTIONS_SITES_USER_TITLE',
  OPTIONS_SITES_USER_HEADER = 'OPTIONS_SITES_USER_HEADER',
  OPTIONS_SITES_DELETE = 'OPTIONS_SITES_DELETE',
  OPTIONS_SITES_MANAGED_TITLE = 'OPTIONS_SITES_MANAGED_TITLE',
  OPTIONS_SITES_MANAGED_HEADER = 'OPTIONS_SITES_MANAGED_HEADER',

  // Options menu
  OPTIONS_GENERAL_TITLE = 'OPTIONS_GENERAL_TITLE',
  OPTIONS_GENERAL_SUBTITLE = 'OPTIONS_GENERAL_SUBTITLE',
  OPTIONS_SITES_TITLE = 'OPTIONS_SITES_TITLE',
  OPTIONS_SITES_SUBTITLE = 'OPTIONS_SITES_SUBTITLE',
  OPTIONS_IGNORE_SUBTITLE = 'OPTIONS_IGNORE_SUBTITLE',
  OPTIONS_IGNORE_TITLE = 'OPTIONS_IGNORE_TITLE',
  OPTIONS_DATA_SUBTITLE = 'OPTIONS_DATA_SUBTITLE',
  OPTIONS_DATA_TITLE = 'OPTIONS_DATA_TITLE',

  // Ignore options
  OPTIONS_IGNORE_EMPTY = 'OPTIONS_IGNORE_EMPTY',
  OPTIONS_IGNORE_DELETE = 'OPTIONS_IGNORE_DELETE',

  // Generate password
  GENERATE_PASSWORD_HOST = 'GENERATE_PASSWORD_HOST',
  GENERATE_PASSWORD_LABEL = 'GENERATE_PASSWORD_LABEL',
  GENERATE_PASSWORD_MATCH_POLICY = 'GENERATE_PASSWORD_MATCH_POLICY',
  GENERATE_PASSWORD_GENERATE = 'GENERATE_PASSWORD_GENERATE',
  GENERATE_PASSWORD_LENGTH = 'GENERATE_PASSWORD_LENGTH',
  GENERATE_PASSWORD_LANGUAGE = 'GENERATE_PASSWORD_LANGUAGE',
  GENERATE_PASSWORD_WORDS = 'GENERATE_PASSWORD_WORDS',
  GENERATE_PASSWORD_MIN_CHAR = 'GENERATE_PASSWORD_MIN_CHAR',
  GENERATE_PASSWORD_MAX_CHAR = 'GENERATE_PASSWORD_MAX_CHAR',
  GENERATE_PASSWORD_DELIMITER = 'GENERATE_PASSWORD_DELIMITER',
  GENERATE_PASSWORD_OR = 'GENERATE_PASSWORD_OR',
  GENERATE_PASSWORD_EDIT = 'GENERATE_PASSWORD_EDIT',
  GENERATE_PASSWORD_PREVIEW = 'GENERATE_PASSWORD_PREVIEW',

  // Iframe
  IFRAME_CLOSE = 'IFRAME_CLOSE',

  // Save
  SAVE_IGNORE = 'SAVE_IGNORE',
}

/**
 * Get localized version of string, based on the browser language.
 * @param messageName Message identifier, see _locales and `LocalizedMessage`.
 * @param subsitutions Dynamic string substitutions, see _locales.
 * @returns Localized message.
 */
export function getMessage(
  messageName: LocalizedMessage,
  ...subsitutions: any[]
) {
  subsitutions = subsitutions.map(substitution => substitution + '')
  let message = browser.i18n.getMessage(messageName, subsitutions)
  if (!message) console.warn(`Missing translation for ${messageName}`)
  return message
}

/**
 * Get currently used locale.
 * @returns Locale string.
 */
export function getLocale() {
  return browser.i18n.getUILanguage()
}
