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
export const get = (): Promise<SitePrefs> => (
  browser.storage.local.get('sitePrefs').then(({ sitePrefs }) => {
    return sitePrefs || {};
  })
);

/**
 * Commit SitePrefs object to local storage.
 * @param authState New SitePrefs object.
 * */
export const set = (sitePrefs: SitePrefs): Promise<void> => (
  browser.storage.local.set({ sitePrefs })
);
