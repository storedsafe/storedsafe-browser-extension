import {
  StoredSafeClearAutoFillPreferencesError,
  StoredSafeClearPreferencesError,
  StoredSafeClearSitePreferencesError,
  StoredSafeGetPreferencesError,
  StoredSafeSetAutoFillPreferencesError,
  StoredSafeSetSitePreferencesError
} from '../errors'
import type { OnAreaChanged } from './StorageArea'

const STORAGE_KEY = 'preferences'
type SerializablePreferences = {
  autoFill: [string, AutoFillPreferences][]
  sites: [string, SitePreferences][]
}
const EMPTY_STATE: SerializablePreferences = {
  autoFill: null,
  sites: null
}

let listeners: OnAreaChanged<Preferences>[] = []

function parse (preferences: SerializablePreferences): Preferences {
  preferences = preferences ?? EMPTY_STATE
  return {
    sites: new Map(preferences?.sites),
    autoFill: new Map(preferences?.autoFill)
  }
}

/**
 * Get and parse preferences from storage.
 * @returns Current preferences.
 * @throws {StoredSafeGetPreferencesError}
 */
export async function get (): Promise<Preferences> {
  try {
    const { preferences } = await browser.storage.local.get(STORAGE_KEY)
    // Convert to Map from serializable format. Map objects are not serializable
    // and will result as an empty object if put in storage.
    return parse(preferences)
  } catch (error) {
    console.error(error)
    throw new StoredSafeGetPreferencesError(error)
  }
}

async function set ({ sites, autoFill }: Preferences): Promise<void> {
  // Convert to serializable format, using null coalescing before converting
  // to array to ensure values are not undefined (causes TypeError).
  await browser.storage.local.set({
    [STORAGE_KEY]: {
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
export async function subscribe (
  cb: OnAreaChanged<Preferences>
): Promise<Preferences> {
  listeners.push(cb)
  return await get()
}

/**
 * Subscribe to changes in storage area.
 * @param cb Callback function to be called when storage area is updated.
 */
export function unsubscribe (cb: OnAreaChanged<Preferences>): void {
  listeners = listeners.filter(listener => listener !== cb)
}

/**
 * Update preferences for `host`.
 * Will overwrite any previous site preferences for `host`.
 * @param host StoredSafe host name.
 * @param sitePreferences New preferences associated with `host`.
 * @throws {StoredSafeGetPreferencesError}
 * @throws {StoredSafeSetSitePreferencesError}
 */
export async function setSitePreferences (
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
export async function clearSitePreferences () {
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
export async function setAutoFillPreferences (
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
 * Clear site preferences for `host`.
 * @param host StoredSafe host name.
 * @throws {StoredSafeGetPreferencesError}
 * @throws {StoredSafeClearAutoFillPreferencesError}
 */
export async function clearAutoFillPreferences () {
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
export async function clear () {
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
