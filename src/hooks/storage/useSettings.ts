/**
 * This module creates a hook which can be used in a React Component to
 * interact with the browser storage API. This module encapsulates the external
 * browser storage API so that implementing components can be run without
 * concerning themselves with external dependencies.
 */
import { useState, useEffect } from 'react'
import { actions as SettingsActions } from '../../model/storage/Settings'

/**
 * Base state of the hook.
 * @param isInitialized - True if the initial fetch has been completed.
 * @param settings - Settings from storage.
 */
interface SettingsState {
  isInitialized: boolean
  settings: Settings
}

/**
 * Functions to mutate the state of the hook. All functions return an empty
 * promise which should be used to handle loading/error states of the
 * implementing component.
 * @param update - Update state of settings.
 * @param clear - Clear user settings, reverting to defaults/managed.
 * @param fetch - Fetch state from storage.
 */
interface SettingsFunctions {
  update: (settings: Settings) => Promise<void>
  clear: () => Promise<void>
  fetch: () => Promise<void>
}

/**
 * Compiled state of the hook.
 */
type SettingsHook = SettingsState & SettingsFunctions

/**
 * Hook to access settings from storage.
 */
export const useSettings = (): SettingsHook => {
  // Keep base state in single object to avoid unnecessary
  // renders when updating multiple fields at once.
  const [state, setState] = useState<SettingsState>({
    isInitialized: false,
    settings: new Map()
  })

  /**
   * Manually fetch settings from storage. This should only be done in
   * situations where you know the hook state is out of sync with the
   * storage area, for example during initialization.
   */
  async function fetch (): Promise<void> {
    const settings = await SettingsActions.fetch()
    setState(prevState => ({
      ...prevState,
      isInitialized: true,
      settings
    }))
  }

  /**
   * Add session to storage.
   * @param host - Host related to the session
   * @param session - Session to be added.
   */
  async function update (settings: Settings): Promise<void> {
    await SettingsActions.update(settings)
  }

  /**
   * Clear all user settings from storage, reverting to defaults.
   */
  async function clear (): Promise<void> {
    await SettingsActions.clear()
  }

  // Run when mounted
  useEffect(() => {
    /**
     * Listen for changes in storage rather than updating state manually so
     * that external updates can be caught without having double updates when
     * changes come from this hook.
     * @param changes - Changes in storage area.
     * @param area - The storage area where the changes occured.
     */
    const storageListener = (
      changes: { [key: string]: browser.storage.StorageChange },
      area: string
    ): void => {
      const change = changes.settings
      if (
        change?.newValue !== undefined &&
        (area === 'sync' || area === 'managed')
      ) {
        fetch().catch(error => console.error(error))
      }
    }

    // Initialize state
    fetch().catch(error => console.error(error))

    // Set up listener when the component is mounted.
    browser.storage.onChanged.addListener(storageListener)

    // Remove listener when the component is unmounted.
    return (): void => {
      browser.storage.onChanged.removeListener(storageListener)
    }
  }, [])

  return {
    ...state,
    fetch,
    update,
    clear
  }
}
