export interface SitePrefs {
  lastUsed?: string;
  sites: {
    [url: string]: {
      username?: string;
      loginType?: 'yubikey' | 'totp';
    };
  };
}

/**
 * Get preferences relating to a certain site from local storage.
 * @return SitePrefs Promise containing SitePrefs object.
 * */
const get = (): Promise<SitePrefs> => (
  browser.storage.local.get('sitePrefs').then(({ sitePrefs }) => {
    return sitePrefs || { sites: {} };
  })
);

/**
 * Commit SitePrefs object to local storage.
 * @param authState New SitePrefs object.
 * */
const set = (sitePrefs: SitePrefs): Promise<void> => (
  browser.storage.local.set({ sitePrefs })
);

export const actions = {
  /**
   * Update the information for the given url.
   * Will create an entry for the url if one doesn't exist.
   * */
  update: (
    url: string,
    username: string,
    loginType: 'yubikey' | 'totp',
  ): Promise<SitePrefs> => {
    return get().then((sitePrefs) => {
      const newSitePrefs = {
        ...sitePrefs,
        lastUsed: url,
        sites: {
          ...sitePrefs.sites,
          [url]: { username, loginType },
        },
      };
      return set(newSitePrefs).then(() => get());
    });
  },

  /**
   * Clear preferences.
   * */
  clear: (): Promise<SitePrefs> => (
    set({ sites: {} }).then(get)
  ),

  /**
   * Fetch state from storage.
   * */
  fetch: get,
};
