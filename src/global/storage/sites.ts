import * as sessionsStorage from './sessions'
import { auth } from '../api'
import {
  StoredSafeSitesAddDuplicateError,
  StoredSafeSitesAddError,
  StoredSafeSitesClearError,
  StoredSafeSitesGetError,
  StoredSafeSitesRemoveError,
  StoredSafeSitesRemoveNotFoundError
} from '../errors'
import type { OnAreaChanged } from './StorageArea'

const STORAGE_KEY = 'sites'
const EMPTY_STATE: Site[] = []

let listeners: OnAreaChanged<Site[]>[] = []

function parse (
  sites: Pick<Site, 'host' | 'apikey'>[],
  managed: boolean = false
): Site[] {
  return (sites ?? EMPTY_STATE).map(site => ({ managed, ...site }))
}

function merge (managed: Site[], sync: Site[]) {
  return [...sync, ...managed]
}

async function getManagedSites (): Promise<Site[]> {
  try {
    const { sites } = await browser.storage.managed.get(STORAGE_KEY)
    return parse(sites, true)
  } catch (error) {
    // Log debug message if managed storage fails because of missing manifest.
    if (error.toString().includes('storage manifest')) {
      console.debug('No managed storage manifest found.')
      return []
    } else throw error
  }
}

async function getSyncSites () {
  const { sites } = await browser.storage.sync.get(STORAGE_KEY)
  return parse(sites ?? EMPTY_STATE)
}
/**
 * Get and parse sites from storage.
 * @returns Current sites.
 * @throws {StoredSafeSitesGetError}
 */
export async function get (): Promise<Site[]> {
  try {
    const sync = await getSyncSites()
    const managed = await getManagedSites()
    // Convert to Map from serializable format. Map objects are not serializable
    // and will result as an empty object if put in storage.
    return merge(managed, sync)
  } catch (error) {
    throw new StoredSafeSitesGetError(error)
  }
}

async function set (sites: Site[]) {
  // Convert to serializable format, using null coalescing before converting
  // to array to ensure values are not undefined (causes TypeError).
  // Filter out managed sites.
  await browser.storage.sync.set({
    [STORAGE_KEY]: (sites ?? []).filter(({ managed }) => !managed)
  })
}

/**
 * Subscribe to changes in storage area and return the current state.
 * @param cb Callback function to be called when storage area is updated.
 * @returns Current sites.
 * @throws {StoredSafeSitesGetError} if get of current state fails.
 */
export async function subscribe (cb: OnAreaChanged<Site[]>): Promise<Site[]> {
  listeners.push(cb)
  return await get()
}

/**
 * Subscribe to changes in storage area.
 * @param cb Callback function to be called when storage area is updated.
 */
export function unsubscribe (cb: OnAreaChanged<Site[]>): void {
  listeners = listeners.filter(listener => listener !== cb)
}

/**
 * Add a new site to user storage.
 * @param host StoredSafe host of new site.
 * @param apikey API key associated with `host`.
 * @throws {StoredSafeSitesGetError}
 * @throws {StoredSafeSitesAddDuplicateError}
 * @throws {StoredSafeSitesAddError}
 */
export async function add (host: string, apikey: string): Promise<void> {
  try {
    // Get current state
    const sites = await get()
    // Make sure no site already exists for `host`.
    if (sites.findIndex(({ host: siteHost }) => siteHost === host) !== -1)
      throw new StoredSafeSitesAddDuplicateError(host)
    // Update sites in storage
    sites.push({ host, apikey, managed: false })
    await set(sites)
  } catch (error) {
    // If error is already processed, throw the processed error
    if (
      error instanceof StoredSafeSitesGetError ||
      error instanceof StoredSafeSitesAddDuplicateError
    )
      throw error
    // Else throw new error
    throw new StoredSafeSitesAddError(host, error)
  }
}

/**
 * Remove site associated with `host`.
 * @param host StoredSafe host associated with site.
 * @throws {StoredSafeSitesGetError}
 * @throws {StoredSafeSitesRemoveNotFoundError}
 * @throws {StoredSafeSitesRemoveError}
 */
export async function remove (host: string): Promise<void> {
  try {
    // Get current state
    let sites = await get()
    // Make sure the URL exists in the list
    if (sites.findIndex(({ host }) => host === host) === -1)
      throw new StoredSafeSitesRemoveNotFoundError(host)
    // Invalidate any existing sessions for site.
    const sessions = await sessionsStorage.get()
    if (sessions.has(host)) await auth.logout(host, sessions.get(host).token)
    // Update sites in storage
    sites = sites.filter(({ host: siteHost }) => siteHost !== host)
    await set(sites)
  } catch (error) {
    // If error is already processed, throw the processed error
    if (
      error instanceof StoredSafeSitesGetError ||
      error instanceof StoredSafeSitesRemoveNotFoundError
    )
      throw error
    // Else throw new error
    throw new StoredSafeSitesRemoveError(host, error)
  }
}

/**
 * Remove all sites.
 * @throws {StoredSafeSitesClearError}
 */
export async function clear (): Promise<void> {
  try {
    const sites = await get()
    const sessions = await sessionsStorage.get()
    // Invalidate out related sessions
    for (const site of sites) {
      if (!site.managed && sessions.has(site.host))
        await auth.logout(site.host, sessions.get(site.host).token)
    }
    await browser.storage.sync.remove(STORAGE_KEY)
  } catch (error) {
    throw new StoredSafeSitesClearError(error)
  }
}

function notify (newValues: Site[], oldValues: Site[]): void {
  for (const listener of listeners) {
    listener(newValues, oldValues)
  }
}

/**
 * When sites update in storage, notify listeners.
 */
browser.storage.onChanged.addListener((changes, area) => {
  if (!!changes[STORAGE_KEY]) {
    const { oldValue, newValue } = changes[STORAGE_KEY]
    if (area === 'sync') {
      // Changes include sync, but not managed; fetch managed
      getManagedSites().then(managed => {
        notify(merge(managed, parse(newValue)), merge(managed, parse(oldValue)))
      })
    } else if (area === 'managed') {
      // Changes include managed, but not sync; fetch sync
      getSyncSites().then(sync => {
        notify(merge(parse(newValue), sync), merge(parse(oldValue), sync))
      })
    }
  }
})
