const systemStorage = browser.storage.managed;
const userStorage = browser.storage.sync;

export interface Site {
  url: string;
  apikey: string;
}

export interface SiteCollection {
  system: Site[];
  user: Site[];
}

/**
 * Layout in storage.
 * */
interface Sites {
  sites: Site[];
}

/**
 * Get sites from system and user storage.
 * @return Sites Promise containg SiteCollection object.
 * */
export const get = (): Promise<SiteCollection> => {
  return Promise.all<Sites, Sites>([
    systemStorage.get('sites') as Promise<Sites>,
    userStorage.get('sites') as Promise<Sites>,
  ]).then(([{ sites: system }, { sites: user }]) => {
    return { system: system || [], user: user || [] };
  });
}

/**
 * Commit Sites object to user storage (managed sites are ignored).
 * @param sites New Sites object.
 * */
export const set = (sites: SiteCollection): Promise<void> => {
  return userStorage.set({ sites: sites.user });
}
