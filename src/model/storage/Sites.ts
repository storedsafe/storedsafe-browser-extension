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

const systemStorage = browser.storage.managed
const userStorage = browser.storage.sync

/**
 * Helper interface to shorten promise type definitions.
 * */
interface StorageSites {
  sites: Site[]
}

/**
 * Helper function to merge system and user sites into a single list.
 * @param siteCollections - Collection of system and user sites.
 * @returns List of all sites available to the user.
 * */
function sitesFromCollections (siteCollections: SiteCollections): Sites {
  return {
    list: siteCollections.system.concat(siteCollections.user),
    collections: siteCollections
  }
}

/**
 * Get sites from system and user storage.
 * @returns Collection of system and user sites.
 * */
async function get (): Promise<SiteCollections> {
  // Set up promises to run parallell
  const userPromise = userStorage.get('sites')
  const systemPromise = systemStorage.get('sites')

  const { sites: userSites } = await userPromise
  const user = userSites === undefined ? [] : userSites

  let system: Site[]
  try {
    const { sites: systemSites } = await systemPromise
    system = systemSites === undefined ? [] : systemSites
  } catch (error) {
    if ((error as Error).message?.includes('storage manifest')) {
      console.warn('No managed storage manifest found.')
    } else {
      throw error
    }
    system = []
  }
  return { system, user }
}

/**
 * Commit Sites object to user storage (managed sites are ignored).
 * @param siteCollections - New user sites.
 * */
async function set (siteCollections: SiteCollections): Promise<void> {
  return await userStorage.set({ sites: siteCollections.user })
}

/// /////////////////////////////////////////////////////////
// Actions

/**
 * Add site to storage.
 * @param site - New site.
 * @returns New user and system sites.
 * */
async function add (site: Site): Promise<Sites> {
  const sites = await get()
  const newSites: SiteCollections = {
    system: sites.system,
    user: [...sites.user, site]
  }
  return await set(newSites).then(
    async () => await get().then(() => sitesFromCollections(newSites))
  )
}

/**
 * Remove site from storage.
 * @param id - Index in user sites array.
 * @returns New user and system sites.
 * */
async function remove (id: number): Promise<Sites> {
  const sites = await get()
  const newSites = {
    system: sites.system,
    user: sites.user.filter((site, siteId) => siteId !== id)
  }
  return await set(newSites).then(
    async () => await get().then(sites => sitesFromCollections(sites))
  )
}

/**
 * Fetch sites from storage.
 * @returns User and system sites.
 * */
async function fetch (): Promise<Sites> {
  return await get().then(sites => sitesFromCollections(sites))
}

export const actions = {
  add,
  remove,
  fetch
}
