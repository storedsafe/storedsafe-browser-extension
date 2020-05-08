export interface SitePrefs {
  [url: string]: {
    username?: string;
    loginType?: 'yubikey' | 'totp';
  };
}

/**
 * Get preferences relating to a certain site from local storage.
 * @return SitePrefs Promise containing SitePrefs object.
 * */
const get = (): Promise<SitePrefs> => (
  browser.storage.local.get('sitePrefs').then(({ sitePrefs }) => {
    return sitePrefs || {};
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
        [url]: { username, loginType },
      };
      return set(newSitePrefs).then(() => get());
    });
  },

  /**
   * Remove preferences for the given url.
   * */
  remove: (url: string): Promise<SitePrefs> => {
    return get().then((sitePrefs) => {
      const newSitePrefs: SitePrefs = {};
      Object.keys(sitePrefs).forEach((siteUrl) => {
        if (siteUrl !== url) {
          newSitePrefs[siteUrl] = sitePrefs[siteUrl];
        }
      });
      return set(newSitePrefs).then(() => get());
    });
  },

  /**
   * Fetch state from storage.
   * */
  fetch: get,
};
