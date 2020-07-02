/**
 * This module creates a hook which can be used in a React Component to
 * interact with the browser storage API. This module encapsulates the external
 * browser storage API so that implementing components can be run without
 * concerning themselves with external dependencies.
 */
import { useState, useEffect } from 'react'
import { actions as BlacklistActions } from '../../model/storage/Blacklist'

/**
 * Base state of the hook.
 * @param isInitialized - True if the initial fetch has been completed.
 * @param blacklist - Blacklist from storage.
 */
interface BlacklistState {
  isInitialized: boolean
  blacklist: Blacklist
}

/**
 * Functions to mutate the state of the hook. All functions return an empty
 * promise which should be used to handle loading/error states of the
 * implementing component.
 * @param add - Add new host to blacklist.
 * @param remove - Remove host from blacklist.
 * @param clear - Clear all blacklist entries from storage.
 * @param fetch - Fetch state from storage.
 */
interface BlacklistFunctions {
  add: (host: string) => Promise<void>
  remove: (host: string) => Promise<void>
  clear: () => Promise<void>
  fetch: () => Promise<void>
}

/**
 * Compiled state of the hook.
 */
type BlacklistHook = BlacklistState & BlacklistFunctions

/**
 * Hook to access Blacklist from storage, listing all hosts that should be left
 * out of automatic save suggestions.
 */
export const useBlacklist = (): BlacklistHook => {
  // Keep base state in single object to avoid unnecessary
  // renders when updating multiple fields at once.
  const [state, setState] = useState<BlacklistState>({
    isInitialized: false,
    blacklist: []
  })

  /**
   * Manually fetch blacklist from storage. This should only be done in situations
   * where you know the hook state is out of sync with the storage area, for
   * example during initialization.
   */
  async function fetch (): Promise<void> {
    const blacklist = await BlacklistActions.fetch()
    setState(prevState => ({
      ...prevState,
      isInitialized: true,
      blacklist
    }))
  }

  /**
   * Add host to storage blacklist.
   * @param host - Host to blacklist.
   */
  async function add (host: string): Promise<void> {
    await BlacklistActions.add(host)
  }

  /**
   * Remove host from storage blacklist.
   * @param host - Host to remove from blacklist.
   */
  async function remove (host: string): Promise<void> {
    await BlacklistActions.remove(host)
  }

  /**
   * Clear all blacklist entries from storage.
   */
  async function clear (): Promise<void> {
    await BlacklistActions.clear()
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
      const change = changes.blacklist
      if (change?.newValue !== undefined && area === 'sync') {
        setState(prevState => ({
          ...prevState,
          blacklist: change.newValue
        }))
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
    add,
    remove,
    clear
  }
}
