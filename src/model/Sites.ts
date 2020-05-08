const systemStorage = browser.storage.managed;
const userStorage = browser.storage.sync;

export interface Site {
  url: string;
  apikey: string;
}

export interface SiteCollections {
  system: Site[];
  user: Site[];
}

export interface Sites {
  list: Site[];
  collections: SiteCollections;
}

interface StorageSites {
  sites: [];
}

const sitesFromCollections = (siteCollections: SiteCollections): Sites => ({
  list: siteCollections.system.concat(siteCollections.user),
  collections: siteCollections,
});

/**
 * Get sites from system and user storage.
 * @return Sites Promise containg SiteCollection object.
 * */
const get = (): Promise<SiteCollections> => {
  return Promise.all<StorageSites, StorageSites>([
    systemStorage.get('sites') as Promise<StorageSites>,
    userStorage.get('sites') as Promise<StorageSites>,
  ]).then(([{ sites: systemSites }, { sites: userSites }]) => {
    const system = systemSites || [];
    const user = userSites || [];
    return { system, user };
  });
};

/**
 * Commit Sites object to user storage (managed sites are ignored).
 * @param sites New Sites object.
 * */
const set = (siteCollections: SiteCollections): Promise<void> => {
  return userStorage.set({ sites: siteCollections.user });
}

export const actions = {
  /**
   * Add site to storage.
   * */
  add: (site: Site): Promise<Sites> => {
    return get().then((sites) => {
      const newSites: SiteCollections = {
        system: sites.system,
        user: [
          ...sites.user,
          site,
        ],
      };
      return set(newSites).then(() => (
        get().then(() => sitesFromCollections(newSites))
      ));
    });
  },

  /**
   * Remove site from storage.
   * @param {id} Index in user sites array.
   * */
  remove: (id: number): Promise<Sites> => {
    return get().then((sites) => {
      const newSites = {
        system: sites.system,
        user: sites.user.filter((site, siteId) => siteId !== id)
      };
      return set(newSites).then(() => (
        get().then((sites) => sitesFromCollections(sites))
      ));
    });
  },

  /**
   * Fetch sites from storage.
   * */
  fetch: (): Promise<Sites> => {
    return get().then((sites) => sitesFromCollections(sites));
  }
};
