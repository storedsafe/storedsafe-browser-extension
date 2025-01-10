import { derived, Readable } from 'svelte/store'
import { browserStorage } from './browserStorage'
import { settings as settingsStorage } from '../../../global/storage'

export const SETTINGS_UPDATE_LOADING_ID = 'settings.update'
export const SETTINGS_CLEAR_LOADING_ID = 'settings.clear'

interface SettingsStore extends Readable<Map<string, Setting>> {
  /**
   * Update user settings.
   * @param values Key-value pairs to map onto settings.
   */
  set: (...values: [string, number | boolean][]) => Promise<void>

  /**
   * Clear all user settings, falling back to default values.
   */
  clear: () => Promise<void>
}

function settingsStore (): SettingsStore {
  const { subscribe } = derived(
    browserStorage,
    $browserStorage => $browserStorage.settings
  )

  return {
    subscribe,
    set: settingsStorage.setValues,
    clear: settingsStorage.clear
  }
}

export const settings = settingsStore()
