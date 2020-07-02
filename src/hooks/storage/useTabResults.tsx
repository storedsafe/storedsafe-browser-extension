/**
 * This module creates a hook which can be used in a React Component to
 * interact with the browser storage API. This module encapsulates the external
 * browser storage API so that implementing components can be run without
 * concerning themselves with external dependencies.
 */
import { useState, useEffect } from 'react'
import { actions as TabResultsActions, parse } from '../../model/storage/TabResults'

/**
 * Base state of the hook.
 * @param isInitialized - True if the initial fetch has been completed.
 * @param tabResults - Tab Results from storage.
 */
interface TabResultsState {
  isInitialized: boolean
  tabResults: TabResults
}

/**
 * Functions to mutate the state of the hook. All functions return an empty
 * promise which should be used to handle loading/error states of the
 * implementing component.
 * @param fetch - Fetch state from storage.
 * @param clear - Clear all tab results from storage.
 */
interface TabResultsFunctions {
  fetch: () => Promise<void>
  clear: () => Promise<void>
}

/**
 * Compiled state of the hook.
 */
type TabResultsHook = TabResultsState & TabResultsFunctions

/**
 * Hook to access tab results from storage.
 */
export const useTabResults = (): TabResultsHook => {
  // Keep base state in single object to avoid unnecessary
  // renders when updating multiple fields at once.
  const [state, setState] = useState<TabResultsState>({
    isInitialized: false,
    tabResults: new Map()
  })

  /**
   * Manually fetch tab results from storage. This should only be done in
   * situations where you know the hook state is out of sync with the storage
   * area, for example during initialization.
   */
  async function fetch (): Promise<void> {
    const tabResults = await TabResultsActions.fetch()
    setState(prevState => ({
      ...prevState,
      isInitialized: true,
      tabResults
    }))
  }

  /**
   * Clear all tab results from storage.
   */
  async function clear (): Promise<void> {
    await TabResultsActions.clear()
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
      const change = changes.tabResults
      if (change?.newValue !== undefined && area === 'local') {
        setState(prevState => ({
          ...prevState,
          tabResults: parse(change.newValue)
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
    clear
  }
}
