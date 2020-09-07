/**
 * Abstraction layer for browser storage API to handle persisting user
 * preferences based on how the user interacts with the extension.
 * Examples of this is when the user decides to save a username or remembering
 * which site the user logged into last.
 * - get/set functions handle all storage interaction.
 * - actions object provides the public interface for the model.
 * */

/**
 * @returns Promise containing the user preferences.
 * */
async function get (): Promise<Preferences> {
  const { preferences } = await browser.storage.local.get('preferences')
  return preferences === undefined ? { sites: {} } : preferences
}

/**
 * Commit user preferences to local storage.
 * @param preferences - New user preferences.
 * */
async function set (preferences: Preferences): Promise<void> {
  return await browser.storage.local.set({ preferences })
}

/// /////////////////////////////////////////////////////////
// Actions

/**
 * Set the last used site.
 * @param host - The last used site host.
 * @returns New user preferences.
 * */
async function setLastUsedSite (host: string): Promise<Preferences> {
  const preferences = await get()
  return await set({ ...preferences, lastUsedSite: host }).then(get)
}

/**
 * Update user preferences for the given host.
 * Will create an entry for the host if one doesn't exist.
 * @param host - The host associated with the preferences.
 * @param sitePreferences - New user preferences for the specified host.
 * @returns New user preferences.
 * */
async function updateSitePreferences (
  host: string,
  sitePreferences: SitePreferences
): Promise<Preferences> {
  const preferences = await get()
  const newSitePreferences = {
    ...preferences,
    sites: {
      ...preferences.sites,
      [host]: sitePreferences
    }
  }
  return await set(newSitePreferences).then(get)
}

/**
 * Set the last used result on a particular site so that this result can
 * be used for autofill-scenarios.
 * @param url - URL of page where result was used.
 * @param host - StoredSafe host where the used result was fetched from.
 * @param objectId - StoredSafe obejct id of the used result.
 */
async function setLastUsedResult (url: string, host: string, objectId: string): Promise<Preferences> {
  const preferences = await get()
  const lastUsedResults = new Map(preferences.lastUsedResults) ?? new Map()
  lastUsedResults.set(url, { host, objectId })
  return await set({
    ...preferences,
    lastUsedResults: [...lastUsedResults]
  }).then(get)
}

/**
 * Clear user preferences.
 * @returns New user preferences.
 * */
async function clear (): Promise<Preferences> {
  return await set({ sites: {} }).then(get)
}

export const actions = {
  setLastUsedResult,
  setLastUsedSite,
  updateSitePreferences,
  clear,
  fetch: get
}
