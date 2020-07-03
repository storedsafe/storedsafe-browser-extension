/**
 * This module creates a hook which can be used in a React Component to
 * interact with the browser storage API. This module encapsulates the external
 * browser storage API so that implementing components can be run without
 * concerning themselves with external dependencies.
 */
import { useState, useEffect } from 'react'
import { actions as PreferencesActions } from '../../model/storage/Preferences'

/**
 * Base state of the hook.
 * @param isInitialized - True if the initial fetch has been completed.
 * @param preferences - Preferences from storage.
 */
interface PreferencesState extends Preferences {
  isInitialized: boolean
}

/**
 * Functions to mutate the state of the hook. All functions return an empty
 * promise which should be used to handle loading/error states of the
 * implementing component.
 * @param setLastUsedSite - Set the last site used for login
 * @param updateSitePreferences - Save username / 2fa preference
 * @param clear - Clear all preferences from storage.
 * @param fetch - Fetch state from storage.
 */
interface PreferencesFunctions {
  setLastUsedSite: (host: string) => Promise<void>
  updateSitePreferences: (
    host: string,
    sitePreferences: SitePreferences
  ) => Promise<void>
  clear: () => Promise<void>
  fetch: () => Promise<void>
}

/**
 * Compiled state of the hook.
 */
type PreferencesHook = PreferencesState & PreferencesFunctions

/**
 * Hook to access preferences from storage.
 */
export const usePreferences = (): PreferencesHook => {
  // Keep base state in single object to avoid unnecessary
  // renders when updating multiple fields at once.
  const [state, setState] = useState<PreferencesState>({
    isInitialized: false,
    sites: {}
  })

  /**
   * Manually fetch preferences from storage. This should only be done in situations
   * where you know the hook state is out of sync with the storage area, for
   * example during initialization.
   */
  async function fetch (): Promise<void> {
    const preferences = await PreferencesActions.fetch()
    setState(prevState => ({
      ...prevState,
      isInitialized: true,
      ...preferences
    }))
  }

  /**
   * Update last used site for login.
   * @param host - Last used site host
   */
  async function setLastUsedSite (host: string): Promise<void> {
    await PreferencesActions.setLastUsedSite(host)
  }

  /**
   * Save username / 2fa preference for user.
   * @param host - Host related to saved preferences
   * @param sitePreferences - New preferences to be saved.
   */
  async function updateSitePreferences (
    host: string,
    sitePreferences: SitePreferences
  ): Promise<void> {
    await PreferencesActions.updateSitePreferences(host, sitePreferences)
  }

  /**
   * Clear all preferences from storage.
   */
  async function clear (): Promise<void> {
    await PreferencesActions.clear()
  }

  // Run when mounted
  useEffect(() => {
    let mounted = true
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
      const change = changes.preferences
      if (mounted && change?.newValue !== undefined && area === 'local') {
        setState(prevState => ({
          ...prevState,
          ...change.newValue
        }))
      }
    }

    // Initialize state
    fetch().catch(error => console.error(error))

    // Set up listener when the component is mounted.
    browser.storage.onChanged.addListener(storageListener)

    // Remove listener when the component is unmounted.
    return (): void => {
      mounted = false
      browser.storage.onChanged.removeListener(storageListener)
    }
  }, [])

  return {
    ...state,
    setLastUsedSite,
    updateSitePreferences,
    fetch,
    clear
  }
}
