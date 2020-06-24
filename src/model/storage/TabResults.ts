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
async function get (): Promise<TabResults> {
  try {
    const { tabResults } = await browser.storage.local.get('tabResults')
    const serializedTabResults: SerializableTabResults =
      tabResults === undefined ? [] : tabResults
    // Convert nested serializable results to Map objects.
    return new Map(
      serializedTabResults.map(([k, v]) => [k, new Map(v)])
    ) as TabResults
  } catch (error) {
    console.error('Error getting tabResults from storage.', error)
    return await Promise.resolve(new Map())
  }
}

/**
 * Commit tab search results to local storage.
 * @param tabResults New tab search results.
 * */
async function set (tabResults: TabResults): Promise<void> {
  try {
    return await browser.storage.local.set({
      // Convert nested Map objects to serializable results.
      tabResults: Array.from(tabResults).map(([k, v]) => [k, Array.from(v)])
    })
  } catch (error) {
    console.error('Error setting tabResults in storage.', error)
  }
}

/// /////////////////////////////////////////////////////////
// Actions

/**
 * Set search results for tab.
 * @param tabId - ID of tab associated with the results.
 * @param results - Results from active sites related to the tab.
 * @returns Updated cached results from all tabs.
 * */
async function setTabResults (
  tabId: number,
  results: Results
): Promise<TabResults> {
  const prevTabResults = await get()
  const newTabResults = new Map([...prevTabResults, [tabId, results]])
  return await set(newTabResults).then(get)
}

/**
 * Remove search results for tab.
 * @param tabId - ID of tab associated with the results.
 * @returns Updated cached results from all tabs.
 * */
async function removeTabResults (tabId: number): Promise<TabResults> {
  const prevResults = await get()
  const newResults = new Map(prevResults)
  newResults.delete(tabId)
  return await set(newResults).then(get)
}

/**
 * Purge host from tab results.
 * @returns Updated cached results from all tabs, with values from host removed.
 * */
async function purgeHost (host: string): Promise<TabResults> {
  const prevTabResults = await get()
  const newTabResults = new Map(prevTabResults)
  for (const results of newTabResults.values()) {
    for (const resultsHost of results.keys()) {
      if (resultsHost === host) {
        results.delete(host)
      }
    }
  }
  return await set(newTabResults).then(get)
}

/**
 * Clear all search results from storage.
 * @returns Updated cached results from all tabs (empty).
 * */
async function clear (): Promise<TabResults> {
  return await set(new Map()).then(get)
}

/**
 * Fetch all cached tab search results from storage.
 * @returns Cached results from all tabs.
 * */

export const actions = {
  setTabResults,
  removeTabResults,
  purgeHost,
  clear,
  fetch: get
}
