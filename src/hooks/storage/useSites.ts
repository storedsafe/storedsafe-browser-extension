/**
 * This module creates a hook which can be used in a React Component to
 * interact with the browser storage API. This module encapsulates the external
 * browser storage API so that implementing components can be run without
 * concerning themselves with external dependencies.
 */
import { useState, useEffect } from 'react'
import { actions as SitesActions } from '../../model/storage/Sites'
import { actions as PreferencesActions } from '../../model/storage/Preferences'
import { actions as SessionsActions } from '../../model/storage/Sessions'
import { actions as StoredSafeActions } from '../../model/storedsafe/StoredSafe'

/**
 * Base state of the hook.
 * @param isInitialized - True if the initial fetch has been completed.
 * @param system - Sites from managed storage.
 * @param user - Sites from sync storage.
 */
interface SitesState {
  isInitialized: boolean
  system: Site[]
  user: Site[]
}

/**
 * State computed based on the base state.
 * @param sites - List of all available sites.
 */
interface ComputedSitesState {
  all: Site[]
}

/**
 * Functions to mutate the state of the hook. All functions return an empty
 * promise which should be used to handle loading/error states of the
 * implementing component.
 * @param fetch - Fetch state from storage.
 * @param add - Add new site to storage.
 * @param remove - Remove site from storage.
 */
interface SitesFunctions {
  fetch: () => Promise<void>
  add: (site: Site) => Promise<void>
  remove: (id: number) => Promise<void>
}

/**
 * Compiled state of the hook.
 */
type SitesHook = SitesState & ComputedSitesState & SitesFunctions

/**
 * Hook to access sites from storage.
 */
export const useSites = (): SitesHook => {
  // Keep base state in single object to avoid unnecessary
  // renders when updating multiple fields at once.
  const [state, setState] = useState<SitesState>({
    isInitialized: false,
    system: [],
    user: []
  })

  /**
   * Manually fetch sites from storage. This should only be done in situations
   * where you know the hook state is out of sync with the storage area, for
   * example during initialization.
   */
  async function fetch (): Promise<void> {
    const sites = await SitesActions.fetch()
    setState(prevState => ({
      ...prevState,
      isInitialized: true,
      system: sites.collections.system,
      user: sites.collections.user
    }))
  }

  /**
   * Add site to storage.
   * @param site - Site to be added.
   */
  async function add (site: Site): Promise<void> {
    await SitesActions.add(site)
  }

  /**
   * Remove site from storage.
   * @param id - Id in user sites list.
   */
  async function remove (id: number): Promise<void> {
    const host = state.user[id]?.host
    const preferences = await PreferencesActions.fetch()
    if (preferences.lastUsedSite === host) {
      await PreferencesActions.setLastUsedSite(undefined)
    }
    const sessions = await SessionsActions.fetch()
    if (sessions.get(host) !== undefined) {
      await StoredSafeActions.logout(host)
    }
    await SitesActions.remove(id)
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
      const change = changes.sites
      if (change?.newValue !== undefined) {
        if (mounted && area === 'managed') {
          setState(prevState => ({
            ...prevState,
            system: change.newValue
          }))
        } else if (mounted && area === 'sync') {
          setState(prevState => ({
            ...prevState,
            user: change.newValue
          }))
        }
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
    all: [...state.system, ...state.user],
    fetch,
    add,
    remove
  }
}
