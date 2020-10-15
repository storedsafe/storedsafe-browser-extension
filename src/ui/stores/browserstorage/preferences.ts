import { derived, Readable } from 'svelte/store'
import { browserStorage } from './browserStorage'
import { preferences as preferencesStorage } from '../../../global/storage'

export const PREFERENCES_SET_AUTO_FILL_LOADING_ID = 'preferences.autofill'
export const PREFERENCES_CLEAR_AUTO_FILL_LOADING_ID = 'preferences.clear.autofill'
export const PREFERENCES_SET_SITE_LOADING_ID = 'preferences.site'
export const PREFERENCES_CLEAR_SITE_LOADING_ID = 'preferences.clear.site'
export const PREFERENCES_CLEAR_LOADING_ID = 'preferences.clear.all'

interface PreferencesStore extends Readable<Preferences> {
  /**
   * Update preferences for `host`.
   * Will overwrite any previous site preferences for `host`.
   * @param host StoredSafe host name.
   * @param sitePreferences New preferences associated with `host`.
   */
  setAutoFillPreferences: (
    url: string,
    autoFillPreferences: AutoFillPreferences
  ) => Promise<void>

  /**
   * Clear all autofill preferences.
   */
  clearAutoFillPreferences: () => Promise<void>

  /**
   * Update auto fill preferences for `url`.
   * Will overwrite any previous auto fill preferences for `url`.
   * @param url Website URL.
   * @param autoFillPreferences New preferences associated with `url`.
   */
  setSitePreferences: (
    host: string,
    sitePreferences: SitePreferences
  ) => Promise<void>

  /**
   * Clear all site preferences.
   */
  clearSitePreferences: () => Promise<void>

  /**
   * Clear all preferences.
   */
  clear: () => Promise<void>
}

function preferencesStore (): PreferencesStore {
  const { subscribe } = derived(
    browserStorage,
    $browserStorage => $browserStorage.preferences
  )

  return {
    subscribe,
    setAutoFillPreferences: preferencesStorage.setAutoFillPreferences,
    setSitePreferences: preferencesStorage.setSitePreferences,
    clearAutoFillPreferences: preferencesStorage.clearAutoFillPreferences,
    clearSitePreferences: preferencesStorage.clearSitePreferences,
    clear: preferencesStorage.clear
  }
}

export const preferences = preferencesStore()
