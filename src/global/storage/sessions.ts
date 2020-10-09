import {
  StoredSafeSessionsAddDuplicateError,
  StoredSafeSessionsAddError,
  StoredSafeSessionsClearError,
  StoredSafeSessionsGetError,
  StoredSafeSessionsRemoveError,
  StoredSafeSessionsRemoveNotFoundError
} from '../errors'
import type { OnAreaChanged } from './StorageArea'

const STORAGE_KEY = 'sessions'
const EMPTY_STATE: [string, Session][] = []

let listeners: OnAreaChanged<Map<string, Session>>[] = []

function parse(sessions: [string, Session][]) {
  return new Map(sessions ?? EMPTY_STATE)
}

/**
 * Get and parse sessions from storage.
 * @returns Current sessions.
 * @throws {StoredSafeSessionsGetError}
 */
export async function get (): Promise<Map<string, Session>> {
  try {
    const { sessions } = await browser.storage.local.get(STORAGE_KEY)
    // Convert to Map from serializable format. Map objects are not serializable
    // and will result as an empty object if put in storage.
    return parse(sessions)
  } catch (error) {
    throw new StoredSafeSessionsGetError(error)
  }
}

async function set (sessions: Map<string, Session>) {
  // Convert to serializable format, using null coalescing before converting
  // to array to ensure values are not undefined (causes TypeError).
  await browser.storage.local.set({
    [STORAGE_KEY]: [...(sessions ?? [])]
  })
}

/**
 * Subscribe to changes in storage area and return the current state.
 * @param cb Callback function to be called when storage area is updated.
 * @returns Current sessions.
 * @throws {StoredSafeSessionsGetError} if get of current state fails.
 */
export async function subscribe (
  cb: OnAreaChanged<Map<string, Session>>
): Promise<Map<string, Session>> {
  listeners.push(cb)
  return await get()
}

/**
 * Subscribe to changes in storage area.
 * @param cb Callback function to be called when storage area is updated.
 */
export function unsubscribe (cb: OnAreaChanged<Map<string, Session>>): void {
  listeners = listeners.filter(listener => listener !== cb)
}

/**
 * Add a new session to storage.
 * @param host StoredSafe host associated with `session`.
 * @param session New session
 * @throws {StoredSafeSessionsGetError}
 * @throws {StoredSafeSessionsAddDuplicateError}
 * @throws {StoredSafeSessionsAddError}
 */
export async function add (host: string, session: Session): Promise<void> {
  try {
    // Get current state
    const sessions = await get()
    // Make sure no session already exists for `host`.
    if (sessions.has(host)) throw new StoredSafeSessionsAddDuplicateError(host)
    // Update sessions in storage
    sessions.set(host, session)
    await set(sessions)
  } catch (error) {
    // If error is already processed, throw the processed error
    if (
      error instanceof StoredSafeSessionsGetError ||
      error instanceof StoredSafeSessionsAddDuplicateError
    )
      throw error
    // Else throw new error
    throw new StoredSafeSessionsAddError(host, error)
  }
}

/**
 * Remove session associated with `host`.
 * @param host StoredSafe host associated with session.
 * @throws {StoredSafeSessionsGetError}
 * @throws {StoredSafeSessionsRemoveNotFoundError}
 * @throws {StoredSafeSessionsRemoveError}
 */
export async function remove (host: string): Promise<void> {
  try {
    // Get current state
    const sessions = await get()
    // Make sure the URL exists in the list
    if (!sessions.has(host))
      throw new StoredSafeSessionsRemoveNotFoundError(host)
    // Update sessions in storage
    sessions.delete(host)
    await set(sessions)
  } catch (error) {
    // If error is already processed, throw the processed error
    if (
      error instanceof StoredSafeSessionsGetError ||
      error instanceof StoredSafeSessionsRemoveNotFoundError
    )
      throw error
    // Else throw new error
    throw new StoredSafeSessionsRemoveError(host, error)
  }
}

/**
 * Remove all sessions.
 * @throws {StoredSafeSessionsClearError}
 */
export async function clear (): Promise<void> {
  try {
    await browser.storage.local.remove(STORAGE_KEY)
  } catch (error) {
    throw new StoredSafeSessionsClearError(error)
  }
}

/**
 * When sessions update in storage, notify listeners.
 */
browser.storage.onChanged.addListener(changes => {
  if (!!changes[STORAGE_KEY]) {
    const { oldValue, newValue } = changes[STORAGE_KEY]
    for (const listener of listeners) {
      listener(parse(newValue), parse(oldValue))
    }
  }
})
