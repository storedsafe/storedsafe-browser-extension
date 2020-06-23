/**
 * Abstraction layer for browser storage API to handle persisting search
 * results related to a browser tab as a means of caching. The extension
 * background script is expected to set/clear this storage area as needed
 * to implement the actual caching.
 * - get/set functions handle all storage interaction.
 * - actions object provides the public interface for the model.
 * */

/**
 * Get tab search results from local storage.
 * @returns Promise containing tab search results.
 * */
function get (): Promise<TabResults> {
  return browser.storage.local.get('tabResults').then(({
    tabResults
  }) => {
    const serializedTabResults = (tabResults || []) as SerializableTabResults
    // Convert nested serializable results to Map objects.
    return new Map(serializedTabResults.map(([k, v]) => [k, new Map(v)])) as TabResults
  })
}

/**
 * Commit tab search results to local storage.
 * @param tabResults New tab search results.
 * */
function set (tabResults: TabResults): Promise<void> {
  return browser.storage.local.set({
    // Convert nested Map objects to serializable results.
    tabResults: Array.from(tabResults).map(([k, v]) => [k, Array.from(v)])
  })
}

export const actions = {
  /**
   * Set search results for tab.
   * @param tabId - ID of tab associated with the results.
   * @param results - Results from active sites related to the tab.
   * @returns Updated cached results from all tabs.
   * */
  setTabResults: (tabId: number, results: Results): Promise<TabResults> => (
    get().then((prevTabResults) => {
      const newTabResults = new Map([...prevTabResults, [tabId, results]])
      return set(newTabResults).then(get)
    })
  ),

  /**
   * Remove search results for tab.
   * @param tabId - ID of tab associated with the results.
   * @returns Updated cached results from all tabs.
   * */
  removeTabResults: (tabId: number): Promise<TabResults> => (
    get().then((prevResults) => {
      const newResults = new Map(prevResults)
      newResults.delete(tabId)
      return set(newResults).then(get)
    })
  ),

  /**
   * Purge host from tab results.
   * @returns Updated cached results from all tabs, with values from host removed.
   * */
  purgeHost: (host: string): Promise<TabResults> => (
    get().then((prevTabResults) => {
      const newTabResults = new Map(prevTabResults)
      for (const results of newTabResults.values()) {
        for (const resultsHost of results.keys()) {
          if (resultsHost === host) {
            results.delete(host)
          }
        }
      }
      return set(newTabResults).then(get)
    })
  ),

  /**
   * Clear all search results from storage.
   * @returns Updated cached results from all tabs (empty).
   * */
  clear: (): Promise<TabResults> => {
    return set(new Map()).then(get)
  },

  /**
   * Fetch all cached tab search results from storage.
   * @returns Cached results from all tabs.
   * */
  fetch: get
}
