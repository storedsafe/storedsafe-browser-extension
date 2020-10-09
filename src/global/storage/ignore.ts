import {
  StoredSafeIgnoreAddDuplicateError,
  StoredSafeIgnoreAddError,
  StoredSafeIgnoreClearError,
  StoredSafeIgnoreGetError,
  StoredSafeIgnoreRemoveError,
  StoredSafeIgnoreRemoveNotFoundError
} from '../errors'
import type { OnAreaChanged } from './StorageArea'

const STORAGE_KEY = 'ignore'
const EMPTY_STATE: string[] = []

let listeners: OnAreaChanged<string[]>[] = []

function parse(ignore: string[]) {
  return ignore ?? EMPTY_STATE
}

/**
 * Get and parse ignore list from storage.
 * @returns Current ignore list.
 * @throws {StoredSafeIgnoreGetError}
 */
export async function get (): Promise<string[]> {
  try {
    const { ignore } = await browser.storage.local.get(STORAGE_KEY)
    return parse(ignore)
  } catch (error) {
    throw new StoredSafeIgnoreGetError(error)
  }
}

async function set (ignore: string[]) {
  await browser.storage.local.set({ ignore })
}

/**
 * Subscribe to changes in storage area and return the current state.
 * @param cb Callback function to be called when storage area is updated.
 * @returns Current ignore list.
 * @throws {StoredSafeIgnoreGetError} if get of current state fails.
 */
export async function subscribe (
  cb: OnAreaChanged<string[]>
): Promise<string[]> {
  listeners.push(cb)
  return await get()
}

/**
 * Subscribe to changes in storage area.
 * @param cb Callback function to be called when storage area is updated.
 */
export function unsubscribe (cb: OnAreaChanged<string[]>): void {
  listeners = listeners.filter(listener => listener !== cb)
}

/**
 * Add a URL to the ignore list.
 * @param url URL that should be ignored when offering to save form data.
 * @throws {StoredSafeIgnoreGetError}
 * @throws {StoredSafeIgnoreAddDuplicateError}
 * @throws {StoredSafeIgnoreAddError}
 */
export async function add (url: string): Promise<void> {
  try {
    // Get current state
    const ignore = await get()
    // Make sure the URL doesn't already exist in the list
    if (ignore.findIndex(ignoreUrl => ignoreUrl === url) === -1)
      throw new StoredSafeIgnoreAddDuplicateError(url)
    // Update ignore list in storage
    ignore.push(url)
    await set(ignore)
  } catch (error) {
    // If error is already processed, throw the processed error
    if (
      error instanceof StoredSafeIgnoreGetError ||
      error instanceof StoredSafeIgnoreAddDuplicateError
    )
      throw error
    // Else throw new error
    throw new StoredSafeIgnoreAddError(url, error)
  }
}

/**
 * Remove a URL from the ignore list.
 * @param url URL that should no longer be ignored when offering to save form data.
 * @throws {StoredSafeIgnoreGetError}
 * @throws {StoredSafeIgnoreRemoveNotFoundError}
 * @throws {StoredSafeIgnoreRemoveError}
 */
export async function remove (url: string): Promise<void> {
  try {
    // Get current state
    let ignore = await get()
    // Make sure the URL exists in the list
    if (ignore.findIndex(ignoreUrl => ignoreUrl === url) !== -1)
      throw new StoredSafeIgnoreRemoveNotFoundError(url)
    // Update ignore list in storage
    ignore = ignore.filter(ignoreUrl => ignoreUrl !== url)
    await set(ignore)
  } catch (error) {
    // If error is already processed, throw the processed error
    if (
      error instanceof StoredSafeIgnoreGetError ||
      error instanceof StoredSafeIgnoreRemoveNotFoundError
    )
      throw error
    // Else throw new error
    throw new StoredSafeIgnoreRemoveError(url, error)
  }
}

/**
 * Remove all URLs from the ignore list.
 * @throws {StoredSafeIgnoreClearError}
 */
export async function clear (): Promise<void> {
  try {
    await browser.storage.local.remove(STORAGE_KEY)
  } catch (error) {
    throw new StoredSafeIgnoreClearError(error)
  }
}

/**
 * When ignore list updates in storage, notify listeners.
 */
browser.storage.onChanged.addListener(changes => {
  if (!!changes[STORAGE_KEY]) {
    const { oldValue, newValue } = changes[STORAGE_KEY]
    for (const listener of listeners) {
      listener(parse(newValue), parse(oldValue))
    }
  }
})
