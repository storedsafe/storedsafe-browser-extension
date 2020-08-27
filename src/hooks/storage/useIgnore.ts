/**
 * This module creates a hook which can be used in a React Component to
 * interact with the browser storage API. This module encapsulates the external
 * browser storage API so that implementing components can be run without
 * concerning themselves with external dependencies.
 */
import { useState, useEffect } from 'react'
import { actions as IgnoreActions } from '../../model/storage/Ignore'

/**
 * Base state of the hook.
 * @param isInitialized - True if the initial fetch has been completed.
 * @param ignore - Ignore from storage.
 */
interface IgnoreState {
  isInitialized: boolean
  ignore: Ignore
}

/**
 * Functions to mutate the state of the hook. All functions return an empty
 * promise which should be used to handle loading/error states of the
 * implementing component.
 * @param add - Add new host to ignore.
 * @param remove - Remove host from ignore.
 * @param clear - Clear all ignore entries from storage.
 * @param fetch - Fetch state from storage.
 */
interface IgnoreFunctions {
  add: (host: string) => Promise<void>
  remove: (host: string) => Promise<void>
  clear: () => Promise<void>
  fetch: () => Promise<void>
}

/**
 * Compiled state of the hook.
 */
type IgnoreHook = IgnoreState & IgnoreFunctions

/**
 * Hook to access Ignore from storage, listing all hosts that should be left
 * out of automatic save suggestions.
 */
export const useIgnore = (): IgnoreHook => {
  // Keep base state in single object to avoid unnecessary
  // renders when updating multiple fields at once.
  const [state, setState] = useState<IgnoreState>({
    isInitialized: false,
    ignore: []
  })

  /**
   * Manually fetch ignore from storage. This should only be done in situations
   * where you know the hook state is out of sync with the storage area, for
   * example during initialization.
   */
  async function fetch (): Promise<void> {
    const ignore = await IgnoreActions.fetch()
    setState(prevState => ({
      ...prevState,
      isInitialized: true,
      ignore
    }))
  }

  /**
   * Add host to storage ignore.
   * @param host - Host to ignore.
   */
  async function add (host: string): Promise<void> {
    await IgnoreActions.add(host)
  }

  /**
   * Remove host from storage ignore.
   * @param host - Host to remove from ignore.
   */
  async function remove (host: string): Promise<void> {
    await IgnoreActions.remove(host)
  }

  /**
   * Clear all ignore entries from storage.
   */
  async function clear (): Promise<void> {
    await IgnoreActions.clear()
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
      const change = changes.ignore
      if (change?.newValue !== undefined && area === 'sync') {
        setState(prevState => ({
          ...prevState,
          ignore: change.newValue
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
