/**
 * Abstraction layer for browser storage API to handle persisting StoredSafe
 * sites available to the user. The preferred way of adding sites is by a
 * managed storage manifest administered by the system administrator. If the
 * user has access to sites outside of the organization or is using a private
 * computer, sites can be added manually by the user and commited to sync
 * storage instead.
 * - get/set functions handle all storage interaction.
 * - actions object provides the public interface for the model.
 * */

const systemStorage = browser.storage.managed;
const userStorage = browser.storage.sync;

/**
 * Helper interface to shorten promise type definitions.
 * */
interface StorageSites {
  sites: Site[];
}

/**
 * Helper function to merge system and user sites into a single list.
 * @param siteCollections - Collection of system and user sites.
 * @returns List of all sites available to the user.
 * */
const sitesFromCollections = (siteCollections: SiteCollections): Sites => ({
  list: siteCollections.system.concat(siteCollections.user),
  collections: siteCollections,
});

/**
 * Get sites from system and user storage.
 * @returns Collection of system and user sites.
 * */
const get = (): Promise<SiteCollections> => {
  return Promise.all<StorageSites, StorageSites>([
    systemStorage.get('sites').catch(() => ({ settings: {} })) as Promise<StorageSites>,
    userStorage.get('sites') as Promise<StorageSites>,
  ]).then(([{ sites: systemSites }, { sites: userSites }]) => {
    const system = systemSites || [];
    const user = userSites || [];
    return { system, user };
  });
};

/**
 * Commit Sites object to user storage (managed sites are ignored).
 * @param siteCollections - New user sites.
 * */
const set = (siteCollections: SiteCollections): Promise<void> => {
  return userStorage.set({ sites: siteCollections.user });
}

export const actions = {
  /**
   * Add site to storage.
   * @param site - New site.
   * @returns New user and system sites.
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
   * @param id - Index in user sites array.
   * @returns New user and system sites.
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
   * @returns User and system sites.
   * */
  fetch: (): Promise<Sites> => {
    return get().then((sites) => sitesFromCollections(sites));
  },
};
