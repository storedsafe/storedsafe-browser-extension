import { derived, Readable } from 'svelte/store'
import { browserStorage } from './browserStorage'
import { sites as sitesStorage } from '../../../global/storage'

export const SITES_ADD_LOADING_ID = 'sites.add'
export const SITES_REMOVE_LOADING_ID = 'sites.remove'

interface SitesStore extends Readable<Site[]> {
  /**
   * Add a StoredSafe site to the extension, making it available for login.
   * @param host StoredSafe host to add.
   * @param apikey API key associated with the StoredSafe host.
   */
  add: (host: string, apikey: string) => Promise<void>

  /**
   * Invalidate the StoredSafe token associated with the host session.
   * @param host StoredSafe host to logout from.
   */
  remove: (host: string) => Promise<void>
}

function sitesStore (): SitesStore {
  const { subscribe } = derived(
    browserStorage,
    $browserStorage => $browserStorage.sites
  )

  return {
    subscribe,
    add: sitesStorage.add,
    remove: sitesStorage.remove
  }
}

export const sites = sitesStore()
