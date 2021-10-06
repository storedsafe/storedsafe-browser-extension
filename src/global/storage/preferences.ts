import {
  StoredSafeClearAddPreferencesError,
  StoredSafeClearAutoFillPreferencesError,
  StoredSafeClearPreferencesError,
  StoredSafeClearSitePreferencesError,
  StoredSafeGetPreferencesError,
  StoredSafeSetVaultPreferencesError,
  StoredSafeSetHostPreferencesError,
  StoredSafeSetAutoFillPreferencesError,
  StoredSafeSetSitePreferencesError
} from '../errors'
import { Logger } from '../logger'
import type { OnAreaChanged } from './StorageArea'

const logger = new Logger('preferences')

export function stripURL(url: string) {
  try {
    return new URL(url).origin ?? url
  } catch {
    return url
  }
}

const STORAGE_KEY = 'preferences'
type SerializablePreferences = {
  add: AddPreferences
  autoFill: [string, AutoFillPreferences][]
  sites: [string, SitePreferences][]
}
const EMPTY_STATE: SerializablePreferences = {
  add: {
    host: null,
    vaults: {}
  },
  autoFill: null,
  sites: null
}

let listeners: OnAreaChanged<Preferences>[] = []

function parse(preferences: SerializablePreferences): Preferences {
  preferences = preferences ?? EMPTY_STATE
  return {
    add: preferences.add,
    sites: new Map(preferences?.sites),
    autoFill: new Map(preferences?.autoFill)
  }
}

/**
 * Get and parse preferences from storage.
 * @returns Current preferences.
 * @throws {StoredSafeGetPreferencesError}
 */
export async function get(): Promise<Preferences> {
  try {
    const { preferences } = await browser.storage.local.get(STORAGE_KEY)
    // Convert to Map from serializable format. Map objects are not serializable
    // and will result as an empty object if put in storage.
    return parse(preferences)
  } catch (error) {
    logger.error(error)
    throw new StoredSafeGetPreferencesError(error)
  }
}

async function set({ add, sites, autoFill }: Preferences): Promise<void> {
  // Convert to serializable format, using null coalescing before converting
  // to array to ensure values are not undefined (causes TypeError).
  await browser.storage.local.set({
    [STORAGE_KEY]: {
      add,
      sites: [...(sites ?? [])],
      autoFill: [...(autoFill ?? [])]
    }
  })
}

/**
 * Subscribe to changes in storage area and return the current state.
 * @param cb Callback function to be called when storage area is updated.
 * @returns Current preferences.
 * @throws {StoredSafeGetPreferencesError} if get of current state fails.
 */
export async function subscribe(
  cb: OnAreaChanged<Preferences>
): Promise<Preferences> {
  listeners.push(cb)
  return await get()
}

/**
 * Subscribe to changes in storage area.
 * @param cb Callback function to be called when storage area is updated.
 */
export function unsubscribe(cb: OnAreaChanged<Preferences>): void {
  listeners = listeners.filter(listener => listener !== cb)
}

/**
 * Update host preferences for adding objects to StoredSafe.
 * @param host Name of StoredSafe host used.
 * @throws {StoredSafeGetPreferencesError}
 * @throws {StoredSafeSetHostPreferencesError}
 */
export async function setHostPreferences(host: string) {
  try {
    let { add, ...preferences } = await get()
    add = {
      host: host,
      vaults: add?.vaults ?? {}
    }
    await set({ ...preferences, add })
  } catch (error) {
    if (error instanceof StoredSafeGetPreferencesError) throw error
    throw new StoredSafeSetHostPreferencesError(error)
  }
}

/**
 * Update preferences for adding objects to StoredSafe.
 * @param host Name of StoredSafe host used.
 * @param vaultId StoredSafe ID of vault used.
 * @throws {StoredSafeGetPreferencesError}
 * @throws {StoredSafeSetVaultPreferencesError}
 */
export async function setVaultPreferences(host: string, vaultId: string) {
  try {
    let { add, ...preferences } = await get()
    add = {
      host: add?.host,
      vaults: {
        ...add?.vaults,
        [host]: vaultId
      }
    }
    await set({ ...preferences, add })
  } catch (error) {
    if (error instanceof StoredSafeGetPreferencesError) throw error
    throw new StoredSafeSetVaultPreferencesError(error)
  }
}

/**
 * Clear all site preferences.
 * @throws {StoredSafeGetPreferencesError}
 * @throws {StoredSafeClearAddPreferencesError}
 */
export async function clearAddPreferences() {
  try {
    const { add, ...preferences } = await get()
    await set({ ...preferences })
  } catch (error) {
    if (error instanceof StoredSafeGetPreferencesError) throw error
    throw new StoredSafeClearAddPreferencesError(error)
  }
}

/**
 * Update preferences for `host`.
 * Will overwrite any previous site preferences for `host`.
 * @param host StoredSafe host name.
 * @param sitePreferences New preferences associated with `host`.
 * @throws {StoredSafeGetPreferencesError}
 * @throws {StoredSafeSetSitePreferencesError}
 */
export async function setSitePreferences(
  host: string,
  sitePreferences: SitePreferences
) {
  try {
    const { sites, ...preferences } = await get()
    sites.set(host, sitePreferences)
    await set({ ...preferences, sites })
  } catch (error) {
    if (error instanceof StoredSafeGetPreferencesError) throw error
    throw new StoredSafeSetSitePreferencesError(host, error)
  }
}

/**
 * Clear all site preferences.
 * @throws {StoredSafeGetPreferencesError}
 * @throws {StoredSafeClearSitePreferencesError}
 */
export async function clearSitePreferences() {
  try {
    const { sites, ...preferences } = await get()
    await set({ ...preferences })
  } catch (error) {
    if (error instanceof StoredSafeGetPreferencesError) throw error
    throw new StoredSafeClearSitePreferencesError(error)
  }
}

/**
 * Update auto fill preferences for `url`.
 * Will overwrite any previous auto fill preferences for `url`.
 * @param url Website URL.
 * @param autoFillPreferences New preferences associated with `url`.
 * @throws {StoredSafeGetPreferencesError}
 * @throws {StoredSafeSetAutoFillPreferencesError}
 */
export async function setAutoFillPreferences(
  url: string,
  autoFillPreferences: AutoFillPreferences
) {
  try {
    const { autoFill, ...preferences } = await get()
    autoFill.set(url, autoFillPreferences)
    await set({ ...preferences, autoFill })
  } catch (error) {
    if (error instanceof StoredSafeGetPreferencesError) throw error
    throw new StoredSafeSetAutoFillPreferencesError(url, error)
  }
}

/**
 * Clear all autofill preferences.
 * @throws {StoredSafeGetPreferencesError}
 * @throws {StoredSafeClearAutoFillPreferencesError}
 */
export async function clearAutoFillPreferences() {
  try {
    const { autoFill, ...preferences } = await get()
    await set({ ...preferences })
  } catch (error) {
    if (error instanceof StoredSafeGetPreferencesError) throw error
    throw new StoredSafeClearAutoFillPreferencesError(error)
  }
}

/**
 * Clear all preferences.
 * @throws {StoredSafeClearPreferencesError}
 */
export async function clear() {
  try {
    await browser.storage.local.remove(STORAGE_KEY)
  } catch (error) {
    throw new StoredSafeClearPreferencesError(error)
  }
}

/**
 * When ignore list updates in storage, notify listeners.
 */
browser.storage.onChanged.addListener(changes => {
  if (!!changes[STORAGE_KEY]) {
    const { oldValue, newValue } = changes[STORAGE_KEY]
    for (const listener of listeners) {
      listener(parse(newValue), parse(oldValue))
    }
  }
})
