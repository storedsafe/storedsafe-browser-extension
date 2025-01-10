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

/**
 * Error occured when getting ignore list.
 */
export class StoredSafeIgnoreGetError extends StoredSafeExtensionError {
  readonly id = 1001
  constructor(error: Error) {
    super(`Error getting ignore list from storage`, error)
  }
}

/**
 * Error occured when adding URL to ignore list.
 */
export class StoredSafeIgnoreAddError extends StoredSafeExtensionError {
  readonly id = 1002
  constructor(url: string, error: Error) {
    super(`Error adding '${url}' to ignore list`, error)
  }
}

/**
 * Attempted to add a duplicate URL to ignore list.
 */
export class StoredSafeIgnoreAddDuplicateError extends StoredSafeExtensionError {
  readonly id = 1003
  constructor(url: string) {
    super(`'${url}' already exists in ignore list`)
  }
}

/**
 * Error occured when removing URL from ignore list.
 */
export class StoredSafeIgnoreRemoveError extends StoredSafeExtensionError {
  readonly id = 1004
  constructor(url: string, error: Error) {
    super(`Error removing '${url}' from ignore list`, error)
  }
}

/**
 * Attempted to remove a URL note in the ignore list from ignore list.
 */
export class StoredSafeIgnoreRemoveNotFoundError extends StoredSafeExtensionError {
  readonly id = 1005
  constructor(url: string) {
    super(`'${url}' doesn't exist in ignore list`)
  }
}

/**
 * Error occured when clearing ignore list.
 */
export class StoredSafeIgnoreClearError extends StoredSafeExtensionError {
  readonly id = 1006
  constructor(error: Error) {
    super(`Error clearing ignore list`, error)
  }
}

/**
 * Error occured when setting site preferences.
 */
export class StoredSafeGetPreferencesError extends StoredSafeExtensionError {
  readonly id = 2001
  constructor(error: Error) {
    super(`Error getting preferences from storage`, error)
  }
}

/**
 * Error occured when setting site preferences.
 */
export class StoredSafeSetSitePreferencesError extends StoredSafeExtensionError {
  readonly id = 2002
  constructor(host: string, error: Error) {
    super(`Error setting site preferences for '${host}'`, error)
  }
}

/**
 * Error occured when setting auto fill preferences.
 */
export class StoredSafeSetAutoFillPreferencesError extends StoredSafeExtensionError {
  readonly id = 2003
  constructor(url: string, error: Error) {
    super(`Error setting auto fill preferences for '${url}'`, error)
  }
}

/**
 * Error occured when clearing site preferences.
 */
export class StoredSafeClearSitePreferencesError extends StoredSafeExtensionError {
  readonly id = 2004
  constructor(error: Error) {
    super(`Error clearing site preferences`, error)
  }
}

/**
 * Error occured when clearing auto fill preferences.
 */
export class StoredSafeClearAutoFillPreferencesError extends StoredSafeExtensionError {
  readonly id = 2005
  constructor(error: Error) {
    super(`Error clearing auto fill preferences`, error)
  }
}

/**
 * Error occured when clearing all preferences.
 */
export class StoredSafeClearPreferencesError extends StoredSafeExtensionError {
  readonly id = 2006
  constructor(error: Error) {
    super(`Error clearing preferences`, error)
  }
}

/**
 * Error occured when updating host preferences.
 */
export class StoredSafeSetHostPreferencesError extends StoredSafeExtensionError {
  readonly id = 2007
  constructor(error: Error) {
    super(`Error setting last host preferences`, error)
  }
}

/**
 * Error occured when updating vault preferences.
 */
export class StoredSafeSetVaultPreferencesError extends StoredSafeExtensionError {
  readonly id = 2008
  constructor(error: Error) {
    super(`Error setting add preferences`, error)
  }
}

/**
 * Error occured when clearing add preferences.
 */
export class StoredSafeClearAddPreferencesError extends StoredSafeExtensionError {
  readonly id = 2009
  constructor(error: Error) {
    super(`Error clearing add preferences`, error)
  }
}

/**
 * Error occured when getting sessions.
 */
export class StoredSafeSessionsGetError extends StoredSafeExtensionError {
  readonly id = 3001
  constructor(error: Error) {
    super(`Error getting sessions from storage`, error)
  }
}

/**
 * Error occured when adding session.
 */
export class StoredSafeSessionsAddError extends StoredSafeExtensionError {
  readonly id = 3002
  constructor(host: string, error: Error) {
    super(`Error adding new session for '${host}' to storage`, error)
  }
}

/**
 * Attempted to add a session which already exists.
 */
export class StoredSafeSessionsAddDuplicateError extends StoredSafeExtensionError {
  readonly id = 3003
  constructor(host: string) {
    super(`Session already exists for '${host}'`)
  }
}

/**
 * Error occured when removing session.
 */
export class StoredSafeSessionsRemoveError extends StoredSafeExtensionError {
  readonly id = 3004
  constructor(host: string, error: Error) {
    super(`Error removing session for '${host}' from storage`, error)
  }
}

/**
 * Attempted to remove a session which doesn't exist.
 */
export class StoredSafeSessionsRemoveNotFoundError extends StoredSafeExtensionError {
  readonly id = 3005
  constructor(host: string) {
    super(`No session found for '${host}'`)
  }
}

/**
 * Error occured when clearing sessions from storage.
 */
export class StoredSafeSessionsClearError extends StoredSafeExtensionError {
  readonly id = 3006
  constructor(error: Error) {
    super(`Error clearing sessions`, error)
  }
}

/**
 * Error occured when getting settings.
 */
export class StoredSafeSettingsGetError extends StoredSafeExtensionError {
  readonly id = 4001
  constructor(error: Error) {
    super(`Error getting settings`, error)
  }
}

/**
 * Attempted to set a settings field value to a field that doesn't exist.
 */
export class StoredSafeSettingsSetValueNotFoundError extends StoredSafeExtensionError {
  readonly id = 4002
  constructor(key: string) {
    super(`'${key}' is not a valid settings property`)
  }
}

/**
 * Attempted to set a settings field which is managed.
 */
export class StoredSafeSettingsSetManagedValueError extends StoredSafeExtensionError {
  readonly id = 4003
  constructor(key: string) {
    super(`'${key}' is a readonly property`)
  }
}

/**
 * Error occured when setting a settings value.
 */
export class StoredSafeSettingsSetValuesError extends StoredSafeExtensionError {
  readonly id = 4004
  constructor(error: Error) {
    super(`Error updating settings`, error)
  }
}

/**
 * Error occured when clearing a settings value.
 */
export class StoredSafeSettingsClearValueError extends StoredSafeExtensionError {
  readonly id = 4005
  constructor(key: string, error: Error) {
    super(`Error clearing '${key}' value in settings`, error)
  }
}

/**
 * Error occured when clearing a settings value.
 */
export class StoredSafeSettingsClearError extends StoredSafeExtensionError {
  readonly id = 4006
  constructor(error: Error) {
    super(`Error clearing settings`, error)
  }
}

/**
 * Error occured when getting sites.
 */
export class StoredSafeSitesGetError extends StoredSafeExtensionError {
  readonly id = 5001
  constructor(error: Error) {
    super(`Error gettings sites from storage`, error)
  }
}

/**
 * Error occured when adding a new site.
 */
export class StoredSafeSitesAddError extends StoredSafeExtensionError {
  readonly id = 5002
  constructor(host: string, error: Error) {
    super(`Error adding site '${host}' to storage`, error)
  }
}

/**
 * Attempted to add a site host which already exists.
 */
export class StoredSafeSitesAddDuplicateError extends StoredSafeExtensionError {
  readonly id = 5003
  constructor(host: string) {
    super(`Site already exists for '${host}'`)
  }
}

/**
 * Error occured when removing an existing site.
 */
export class StoredSafeSitesRemoveError extends StoredSafeExtensionError {
  readonly id = 5004
  constructor(host: string, error: Error) {
    super(`Error removing site '${host}' from storage`, error)
  }
}

/**
 * Attempted to remove a site which doesn't exist.
 */
export class StoredSafeSitesRemoveNotFoundError extends StoredSafeExtensionError {
  readonly id = 5005
  constructor(host: string) {
    super(`No site exists for '${host}'`)
  }
}

/**
 * Error occured when clearing sites from storage.
 */
export class StoredSafeSitesClearError extends StoredSafeExtensionError {
  readonly id = 5006
  constructor(error: Error) {
    super(`Error clearing sites`, error)
  }
}

/**
 * Error occured when clearing all data.
 */
export class StoredSafeClearAllDataError extends StoredSafeExtensionError {
  readonly id = 6001
  constructor(error: Error) {
    super(`Error clearing all data`, error)
  }
}

/**
 * Unknown error occured during network request.
 */
export class StoredSafeNetworkError extends StoredSafeAPIError {
  readonly id = 7001
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

/**
 * Error occured when logging in with wrong credentials.
 */
export class StoredSafeAuthLoginError extends StoredSafeAPIError {
  readonly id = 8001
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
  readonly id = 8002
  constructor(status: number) {
    super(`Logout failed with status (${status}), discarded session.`)
  }
}

/**
 * Unauthorized error when interacting with StoredSafe.
 */
export class StoredSafeInvalidTokenError extends StoredSafeAPIError {
  readonly id = 8003
  constructor() {
    super(`Invalid token, discarded session.`)
  }
}

/**
 * Error occured when searching in StoredSafe.
 */
export class StoredSafeSearchError extends StoredSafeAPIError {
  readonly id = 9001
  constructor(status: number) {
    super(`Search failed with status (${status}).`)
  }
}

/**
 * Error occured when decrypting object.
 */
export class StoredSafeDecryptError extends StoredSafeAPIError {
  readonly id = 9002
  constructor(status: number) {
    super(`Decrypt failed with status (${status}).`)
  }
}

/**
 * Error occured when parsing a StoredSafe object.
 */
export class StoredSafeParseObjectError extends StoredSafeAPIError {
  readonly id = 9003
  constructor() {
    super(`Failed to parse object.`)
  }
}

/**
 * Error occured when editing an object.
 */
export class StoredSafeEditError extends StoredSafeAPIError {
  readonly id = 9004
  constructor(status: number) {
    super(`Edit failed with status (${status}).`)
  }
}

/**
 * Error occured when deleting an object.
 */
export class StoredSafeDeleteError extends StoredSafeAPIError {
  readonly id = 9005
  constructor(status: number) {
    super(`Delete failed with status (${status}).`)
  }
}

/**
 * Error occured when fetching vaults.
 */
export class StoredSafeGetVaultsError extends StoredSafeAPIError {
  readonly id = 9006
  constructor(status: number) {
    super(`Get vaults failed with status (${status}).`)
  }
}

/**
 * Error occured when fetching templates.
 */
export class StoredSafeGetTemplatesError extends StoredSafeAPIError {
  readonly id = 9007
  constructor(status: number) {
    super(`Get templates failed with status (${status}).`)
  }
}

/**
 * Error occured when fetching password policies.
 */
export class StoredSafeGetPoliciesError extends StoredSafeAPIError {
  readonly id = 9008
  constructor(status: number) {
    super(`Get password policies failed with status (${status}).`)
  }
}

/**
 * Error occured when fetching password policies.
 */
export class StoredSafeAddObjectError extends StoredSafeAPIError {
  readonly id = 9009
  constructor(status: number) {
    super(`Add object failed with status (${status}).`)
  }
}

/**
 * Error occured when generating password .
 */
export class StoredSafeGeneratePasswordError extends StoredSafeAPIError {
  readonly id = 9010
  constructor(status: number) {
    super(`Generate password failed with status (${status}).`)
  }
}
