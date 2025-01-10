////////////////////////////////////////////////////////////
// Interfaces and types related to the browser storage areas.

/**
 * @param value Value of settings field.
 * @param managed True if readonly (from managed storage).
 * */
interface Setting {
  value: number | boolean
  managed: boolean
}

/**
 * Data required to authenticate with a site.
 * @param host StoredSafe host name.
 * @param apikey API key related to StoredSafe host.
 * @param managed True if readonly (from managed storage).
 * */
interface Site {
  host: string
  apikey: string
  managed: boolean
}

/**
 * Data related to a session.
 * @param token StoredSafe token aquired from a StoredSafe host.
 * @param createAt Timestamp of when the session was created.
 * @param warnings Warnings related to StoredSafe host.
 * @param violations Violations related to StoredSafe host.
 * @param timeout StoredSafe server timeout, used for keepalive timer.
 * */
interface Session {
  token: string
  createdAt: number
  warnings: string[]
  violations: string[]
  timeout: number
}

type LoginType = 'totp' | 'yubikey'

/**
 * Preferences for adding new objects to StoredSafe.
 * @param host StoredSafe host preference for add.
 * @param vaults Mapping of hosts to preferred vault IDs.
 * */
interface AddPreferences {
  host: string,
  vaults: {
    [host: string]: string // vaultId
  }
}

/**
 * Preferences for a single site.
 * @param username Saved username.
 * @param loginType Last used login type.
 * */
interface SitePreferences {
  username?: string
  loginType?: LoginType
}

/**
 * Preferences for auto fill on website.
 * @param host StoredSafe host
 * @param objectId ID of StoredSafe object on `host` to use for auto fill.
 * */
interface AutoFillPreferences {
  host?: string
  objectId?: string
}

/**
 * Preferences based on user interaction.
 * @param add (optional) Preferences for adding object to StoredSafe.
 * @param sites (optional) Preferences per host.
 * @param autoFill (optional) Preferences for auto fill.
 * */
interface Preferences {
  add?: AddPreferences
  sites?: Map<string, SitePreferences>
  autoFill?: Map<string, AutoFillPreferences>
}

/**
 * All fields in storage.
 * @param ignore List of URLs to ignore when offering to save form data.
 * @param preferences Preferences based on user interaction.
 * @param sessions List of active sessions.
 * @param settings User settings and settings managed by organization.
 * @param sites StoredSafe hosts and API keys added by user or by organization.
 */
interface ExtensionStorage {
  ignore: string[] // Local
  preferences: Preferences // Local
  sessions: Map<string, Session> // Local
  settings: Map<string, Setting> // Sync and Managed
  sites: Site[] // Sync and Managed
}

////////////////////////////////////////////////////////////
// Simplified representation of StoredSafe data.

/**
 * Representation of field inside a StoredSafe object
 * or a StoredSafe template.
 * @param name Identifying field name.
 * @param title Display title of field.
 * @param type Input type of field.
 * @param isEncrypted True if the field is an encrypted type.
 * @param required True if the field is mandatory.
 * @param options (optional) Options if type is select.
 * @param options_default (optional) Default selection for options.
 * @param placeholder (optional) Placeholder text for input.
 * @param value (optional) Value of field, if decrypted object.
 * @param isPassword (optional) True if the field should be displayed as a password.
 * @param pwgen (optional) True if the field should have a password generator.
 * */
interface StoredSafeField {
  name: string
  title: string
  type: string
  isEncrypted: boolean
  required: boolean
  options?: string[]
  options_default?: string
  placeholder?: string
  value?: string
  isPassword?: boolean
  pwgen?: boolean
}

/**
 * @param host StoredSafe host where the object is stored.
 * @param id StoredSafe ID of the object.
 * @param templateId StoredSafe ID of the associated template.
 * @param vaultId StoredSafe ID of the containing vault.
 * @param name Name of object.
 * @param type Template title.
 * @param icon Name of template icon.
 * @param isDecrypted True if the object has been decrypted.
 * @param fields Associated fields and values.
 * */
interface StoredSafeObject {
  host: string
  id: string
  templateId: string
  vaultId: string
  name: string
  type: string
  icon: string
  isDecrypted: boolean
  fields: StoredSafeField[]
}

/**
 * Rules for password policies.
 * @param id StoredSafe ID for password policy.
 * @param name Display name of password policy.
 * @param ...rules
 */
interface StoredSafePasswordPolicy {
  id: number
  name: string
  rules: {
    min_length?: number
    max_length?: number
    min_lowercase_chars?: number
    max_lowercase_chars?: number
    min_uppercase_chars?: number
    max_uppercase_chars?: number
    disallow_numeric_chars?: boolean
    disallow_numeric_first?: boolean
    disallow_numeric_last?: boolean
    min_numeric_chars?: number
    max_numeric_chars?: number
    disallow_nonalphanumeric_chars?: boolean
    disallow_nonalphanumeric_first?: boolean
    disallow_nonalphanumeric_last?: boolean
    min_nonalphanumeric_chars?: number
    max_nonalphanumeric_chars?: number
  }
}

/**
 * @param id StoredSafe ID for vault.
 * @param name Display name of vault.
 * @param permissions 1 = Read, 2 = Write, 4 = Admin.
 * @param policyId ID of password policy for vault.
 * */
interface StoredSafeVault {
  id: string
  name: string
  permissions: number
  policyId: number
}

/**
 * @param id StoredSafe ID for template.
 * @param name Display name of template.
 * @param icon Name of associated icon (see assets folder).
 * @param structure Fields associated with template.
 * */
interface StoredSafeTemplate {
  id: string
  name: string
  icon: string
  structure: StoredSafeField[]
}
