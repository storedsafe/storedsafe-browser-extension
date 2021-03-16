export abstract class StoredSafeBaseError extends Error {
  readonly id: number = -1
  readonly name: string = 'StoredSafeError'

  constructor(message: string, error?: Error) {
    super(message)
    if (!!error?.stack) {
      this.stack = error?.stack
    }
  }

  toString() {
    return `(${this.id}) ${this.message}`
  }
}

export class StoredSafeExtensionError extends StoredSafeBaseError {
  readonly name = 'StoredSafeExtensionError'
}
export class StoredSafeAPIError extends StoredSafeBaseError {
  readonly name = 'StoredSafeAPIError'
}

const IGNORE_ID = 1000

/**
 * Error occured when getting ignore list.
 */
export class StoredSafeIgnoreGetError extends StoredSafeExtensionError {
  readonly id = IGNORE_ID + 1
  constructor(error: Error) {
    super(`Error getting ignore list from storage`, error)
  }
}

/**
 * Error occured when adding URL to ignore list.
 */
export class StoredSafeIgnoreAddError extends StoredSafeExtensionError {
  readonly id = IGNORE_ID + 2
  constructor(url: string, error: Error) {
    super(`Error adding '${url}' to ignore list`, error)
  }
}

/**
 * Attempted to add a duplicate URL to ignore list.
 */
export class StoredSafeIgnoreAddDuplicateError extends StoredSafeExtensionError {
  readonly id = IGNORE_ID + 3
  constructor(url: string) {
    super(`'${url}' already exists in ignore list`)
  }
}

/**
 * Error occured when removing URL from ignore list.
 */
export class StoredSafeIgnoreRemoveError extends StoredSafeExtensionError {
  readonly id = IGNORE_ID + 4
  constructor(url: string, error: Error) {
    super(`Error removing '${url}' from ignore list`, error)
  }
}

/**
 * Attempted to remove a URL note in the ignore list from ignore list.
 */
export class StoredSafeIgnoreRemoveNotFoundError extends StoredSafeExtensionError {
  readonly id = IGNORE_ID + 5
  constructor(url: string) {
    super(`'${url}' doesn't exist in ignore list`)
  }
}

/**
 * Error occured when clearing ignore list.
 */
export class StoredSafeIgnoreClearError extends StoredSafeExtensionError {
  readonly id = IGNORE_ID + 6
  constructor(error: Error) {
    super(`Error clearing ignore list`, error)
  }
}

const PREFERENCES_ID = 2000

/**
 * Error occured when setting site preferences.
 */
export class StoredSafeGetPreferencesError extends StoredSafeExtensionError {
  readonly id = PREFERENCES_ID + 1
  constructor(error: Error) {
    super(`Error getting preferences from storage`, error)
  }
}

/**
 * Error occured when setting site preferences.
 */
export class StoredSafeSetSitePreferencesError extends StoredSafeExtensionError {
  readonly id = PREFERENCES_ID + 1
  constructor(host: string, error: Error) {
    super(`Error setting site preferences for '${host}'`, error)
  }
}

/**
 * Error occured when setting auto fill preferences.
 */
export class StoredSafeSetAutoFillPreferencesError extends StoredSafeExtensionError {
  readonly id = PREFERENCES_ID + 2
  constructor(url: string, error: Error) {
    super(`Error setting auto fill preferences for '${url}'`, error)
  }
}

/**
 * Error occured when clearing site preferences.
 */
export class StoredSafeClearSitePreferencesError extends StoredSafeExtensionError {
  readonly id = PREFERENCES_ID + 3
  constructor(error: Error) {
    super(`Error clearing site preferences`, error)
  }
}

/**
 * Error occured when clearing auto fill preferences.
 */
export class StoredSafeClearAutoFillPreferencesError extends StoredSafeExtensionError {
  readonly id = PREFERENCES_ID + 4
  constructor(error: Error) {
    super(`Error clearing auto fill preferences`, error)
  }
}

/**
 * Error occured when clearing all preferences.
 */
export class StoredSafeClearPreferencesError extends StoredSafeExtensionError {
  readonly id = PREFERENCES_ID + 5
  constructor(error: Error) {
    super(`Error clearing preferences`, error)
  }
}

/**
 * Error occured when updating add preferences.
 */
export class StoredSafeSetAddPreferencesError extends StoredSafeExtensionError {
  readonly id = PREFERENCES_ID + 2
  constructor(error: Error) {
    super(`Error setting add preferences`, error)
  }
}

/**
 * Error occured when clearing add preferences.
 */
export class StoredSafeClearAddPreferencesError extends StoredSafeExtensionError {
  readonly id = PREFERENCES_ID + 6
  constructor(error: Error) {
    super(`Error clearing add preferences`, error)
  }
}

const SESSIONS_ID = 3000

/**
 * Error occured when getting sessions.
 */
export class StoredSafeSessionsGetError extends StoredSafeExtensionError {
  readonly id = SESSIONS_ID + 1
  constructor(error: Error) {
    super(`Error getting sessions from storage`, error)
  }
}

/**
 * Error occured when adding session.
 */
export class StoredSafeSessionsAddError extends StoredSafeExtensionError {
  readonly id = SESSIONS_ID + 2
  constructor(host: string, error: Error) {
    super(`Error adding new session for '${host}' to storage`, error)
  }
}

/**
 * Attempted to add a session which already exists.
 */
export class StoredSafeSessionsAddDuplicateError extends StoredSafeExtensionError {
  readonly id = SESSIONS_ID + 3
  constructor(host: string) {
    super(`Session already exists for '${host}'`)
  }
}

/**
 * Error occured when removing session.
 */
export class StoredSafeSessionsRemoveError extends StoredSafeExtensionError {
  readonly id = SESSIONS_ID + 4
  constructor(host: string, error: Error) {
    super(`Error removing session for '${host}' from storage`, error)
  }
}

/**
 * Attempted to remove a session which doesn't exist.
 */
export class StoredSafeSessionsRemoveNotFoundError extends StoredSafeExtensionError {
  readonly id = SESSIONS_ID + 5
  constructor(host: string) {
    super(`No session found for '${host}'`)
  }
}

/**
 * Error occured when clearing sessions from storage.
 */
export class StoredSafeSessionsClearError extends StoredSafeExtensionError {
  readonly id = SESSIONS_ID + 6
  constructor(error: Error) {
    super(`Error clearing sessions`, error)
  }
}

const SETTINGS_ID = 4000

/**
 * Error occured when getting settings.
 */
export class StoredSafeSettingsGetError extends StoredSafeExtensionError {
  readonly id = SETTINGS_ID + 1
  constructor(error: Error) {
    super(`Error getting settings`, error)
  }
}

/**
 * Attempted to set a settings field value to a field that doesn't exist.
 */
export class StoredSafeSettingsSetValueNotFoundError extends StoredSafeExtensionError {
  readonly id = SETTINGS_ID + 2
  constructor(key: string) {
    super(`'${key}' is not a valid settings property`)
  }
}

/**
 * Attempted to set a settings field which is managed.
 */
export class StoredSafeSettingsSetManagedValueError extends StoredSafeExtensionError {
  readonly id = SETTINGS_ID + 3
  constructor(key: string) {
    super(`'${key}' is a readonly property`)
  }
}

/**
 * Error occured when setting a settings value.
 */
export class StoredSafeSettingsSetValuesError extends StoredSafeExtensionError {
  readonly id = SETTINGS_ID + 4
  constructor(error: Error) {
    super(`Error updating settings`, error)
  }
}

/**
 * Error occured when clearing a settings value.
 */
export class StoredSafeSettingsClearValueError extends StoredSafeExtensionError {
  readonly id = SETTINGS_ID + 5
  constructor(key: string, error: Error) {
    super(`Error clearing '${key}' value in settings`, error)
  }
}

/**
 * Error occured when clearing a settings value.
 */
export class StoredSafeSettingsClearError extends StoredSafeExtensionError {
  readonly id = SETTINGS_ID + 6
  constructor(error: Error) {
    super(`Error clearing settings`, error)
  }
}

const SITES_ID = 5000

/**
 * Error occured when getting sites.
 */
export class StoredSafeSitesGetError extends StoredSafeExtensionError {
  readonly id = SITES_ID + 1
  constructor(error: Error) {
    super(`Error gettings sites from storage`, error)
  }
}

/**
 * Error occured when adding a new site.
 */
export class StoredSafeSitesAddError extends StoredSafeExtensionError {
  readonly id = SITES_ID + 2
  constructor(host: string, error: Error) {
    super(`Error adding site '${host}' to storage`, error)
  }
}

/**
 * Attempted to add a site host which already exists.
 */
export class StoredSafeSitesAddDuplicateError extends StoredSafeExtensionError {
  readonly id = SITES_ID + 3
  constructor(host: string) {
    super(`Site already exists for '${host}'`)
  }
}

/**
 * Error occured when removing an existing site.
 */
export class StoredSafeSitesRemoveError extends StoredSafeExtensionError {
  readonly id = SITES_ID + 4
  constructor(host: string, error: Error) {
    super(`Error removing site '${host}' from storage`, error)
  }
}

/**
 * Attempted to remove a site which doesn't exist.
 */
export class StoredSafeSitesRemoveNotFoundError extends StoredSafeExtensionError {
  readonly id = SITES_ID + 5
  constructor(host: string) {
    super(`No site exists for '${host}'`)
  }
}

/**
 * Error occured when clearing sites from storage.
 */
export class StoredSafeSitesClearError extends StoredSafeExtensionError {
  readonly id = SITES_ID + 6
  constructor(error: Error) {
    super(`Error clearing sites`, error)
  }
}

const CLEAR_ID = 6000

/**
 * Error occured when clearing all data.
 */
export class StoredSafeClearAllDataError extends StoredSafeExtensionError {
  readonly id = CLEAR_ID + 1
  constructor(error: Error) {
    super(`Error clearing all data`, error)
  }
}

const NETWORK_ID = 7000

/**
 * Unknown error occured during network request.
 */
export class StoredSafeNetworkError extends StoredSafeAPIError {
  readonly id = NETWORK_ID + 1
  readonly networkError: string
  constructor(error: Error, status?: number) {
    super(
      `Network error ${status !== undefined ? `(${status})` : ''
      }, please verify the URL is reachable and try again.`
    )
    this.stack = error.stack
    this.networkError = error.message
  }
}

const AUTH_ID = 8000

/**
 * Error occured when logging in with wrong credentials.
 */
export class StoredSafeAuthLoginError extends StoredSafeAPIError {
  readonly id = AUTH_ID + 1
  constructor() {
    super(
      `Invalid login username, passphrase, otp or API key, please try again`
    )
  }
}

/**
 * Error occured when logging out from StoredSafe.
 */
export class StoredSafeAuthLogoutError extends StoredSafeAPIError {
  readonly id = AUTH_ID + 2
  constructor(status: number) {
    super(`Logout failed with status (${status}), discarded session.`)
  }
}

const OBJECT_ID = 9000

/**
 * Error occured when searching in StoredSafe.
 */
export class StoredSafeSearchError extends StoredSafeAPIError {
  readonly id = OBJECT_ID + 1
  constructor(status: number) {
    super(`Search failed with status (${status}).`)
  }
}

/**
 * Error occured when decrypting object.
 */
export class StoredSafeDecryptError extends StoredSafeAPIError {
  readonly id = OBJECT_ID + 2
  constructor(status: number) {
    super(`Decrypt failed with status (${status}).`)
  }
}

/**
 * Error occured when parsing a StoredSafe object.
 */
export class StoredSafeParseObjectError extends StoredSafeAPIError {
  readonly id = OBJECT_ID + 3
  constructor() {
    super(`Failed to parse object.`)
  }
}

/**
 * Error occured when editing an object.
 */
export class StoredSafeEditError extends StoredSafeAPIError {
  readonly id = OBJECT_ID + 4
  constructor(status: number) {
    super(`Edit failed with status (${status}).`)
  }
}

/**
 * Error occured when deleting an object.
 */
export class StoredSafeDeleteError extends StoredSafeAPIError {
  readonly id = OBJECT_ID + 5
  constructor(status: number) {
    super(`Delete failed with status (${status}).`)
  }
}

/**
 * Error occured when fetching vaults.
 */
export class StoredSafeGetVaultsError extends StoredSafeAPIError {
  readonly id = OBJECT_ID + 6
  constructor(status: number) {
    super(`Get vaults failed with status (${status}).`)
  }
}

/**
 * Error occured when fetching templates.
 */
export class StoredSafeGetTemplatesError extends StoredSafeAPIError {
  readonly id = OBJECT_ID + 7
  constructor(status: number) {
    super(`Get templates failed with status (${status}).`)
  }
}

/**
 * Error occured when fetching password policies.
 */
export class StoredSafeGetPoliciesError extends StoredSafeAPIError {
  readonly id = OBJECT_ID + 8
  constructor(status: number) {
    super(`Get password policies failed with status (${status}).`)
  }
}

/**
 * Error occured when fetching password policies.
 */
export class StoredSafeAddObjectError extends StoredSafeAPIError {
  readonly id = OBJECT_ID + 9
  constructor(status: number) {
    super(`Add object failed with status (${status}).`)
  }
}

/**
 * Error occured when generating password .
 */
export class StoredSafeGeneratePasswordError extends StoredSafeAPIError {
  readonly id = OBJECT_ID + 10
  constructor(status: number) {
    super(`Generate password failed with status (${status}).`)
  }
}
