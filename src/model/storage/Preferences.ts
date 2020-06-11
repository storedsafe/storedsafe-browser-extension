/**
 * Abstraction layer for browser storage API to handle persisting user
 * preferences based on how the user interacts with the extension.
 * Examples of this is when the user decides to save a username or remembering
 * which site the user logged into last.
 * - get/set functions handle all storage interaction.
 * - actions object provides the public interface for the model.
 *
 * @packageDocumentation
 * */

/**
 * @returns Promise containing the user preferences.
 * */
const get = (): Promise<Preferences> => (
  browser.storage.local.get('preferences').then(({ preferences }) => {
    return preferences || { sites: {} };
  })
);

/**
 * Commit user preferences to local storage.
 * @param preferences - New user preferences.
 * */
const set = (preferences: Preferences): Promise<void> => (
  browser.storage.local.set({ preferences })
);

export const actions = {
  /**
   * Set the last used site.
   * @param host - The last used site host.
   * @returns New user preferences.
   * */
  setLastUsedSite: (host: string): Promise<Preferences> => (
    get().then((preferences) => (
      set({
        ...preferences,
        lastUsedSite: host,
      }).then(get)
    ))
  ),

  /**
   * Update user preferences for the given host.
   * Will create an entry for the host if one doesn't exist.
   * @param host - The host associated with the preferences.
   * @param sitePreferences - New user preferences for the specified host.
   * @returns New user preferences.
   * */
  updateSitePreferences: (
    host: string,
    sitePreferences: SitePreferences,
  ): Promise<Preferences> => {
    return get().then((preferences) => {
      const newSitePreferences = {
        ...preferences,
        sites: {
          ...preferences.sites,
          [host]: sitePreferences,
        },
      };
      return set(newSitePreferences).then(() => get());
    });
  },

  /**
   * Clear user preferences.
   * @returns New user preferences.
   * */
  clear: (): Promise<Preferences> => (
    set({ sites: {} }).then(get)
  ),

  /**
   * Fetch state from storage.
   * @returns User preferences.
   * */
  fetch: get,
};
