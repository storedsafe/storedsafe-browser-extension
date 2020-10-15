import { derived, Readable } from 'svelte/store'
import { browserStorage } from './browserStorage'
import { ignore as ignoreStorage } from '../../../global/storage'

export const IGNORE_ADD_LOADING_ID = 'ignore.add'
export const IGNORE_REMOVE_LOADING_ID = 'ignore.remove'

interface IgnoreStore extends Readable<string[]> {
  /**
   * Add a URL to the ignore list, making it exempt from save prompts.
   * @param url URL to ignore for save prompts.
   */
  add: (url: string) => Promise<void>

  /**
   * Invalidate the StoredSafe token associated with the host session.
   * @param url StoredSafe host to logout from.
   */
  remove: (url: string) => Promise<void>

  /**
   * Clear all URLs from ignore list.
   */
  clear: () => Promise<void>
}

function ignoreStore (): IgnoreStore {
  const { subscribe } = derived(
    browserStorage,
    $browserStorage => $browserStorage.ignore
  )

  return {
    subscribe,
    add: ignoreStorage.add,
    remove: ignoreStorage.remove,
    clear: ignoreStorage.clear
  }
}

export const ignore = ignoreStore()
