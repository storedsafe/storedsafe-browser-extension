/**
 * Abstraction layer for browser storage API to handle persisting StoredSafe
 * sessions as a means of indicating whether a user is logged into a site or
 * not. The extension background script is expected to set/clear this storage
 * area as a user performs a login/logout action or when a session times out.
 * - get/set functions handle all storage interaction.
 * - actions object provides the public interface for the model.
 * */

import { StorageChangeListener } from "./storageTools"

/**
 * Parse serialized sessions from storage.
 * @param sessions - Serializable sessions from storage
 */
export function parse (sessions: SerializableSessions): Sessions {
  return new Map(sessions === undefined ? [] : sessions)
}

/**
 * Get sessions from local storage.
 * @returns Promise containing all currently active sessions.
 * */
async function get (): Promise<Sessions> {
  const { sessions } = await browser.storage.local.get('sessions')
  return parse(sessions)
}

/**
 * Commit Sessions object to sync storage.
 * @param sessions - All currently active sessions.
 * @returns Empty promise.
 * */
async function set (sessions: Sessions): Promise<void> {
  return await browser.storage.local.set({
    sessions: [...sessions]
  })
}

/// /////////////////////////////////////////////////////////
// Actions

/**
 * Add new session to storage.
 * @param host - Host that the session is associated with.
 * @param session - New session data.
 * @returns Updated active sessions.
 * */
async function add (host: string, session: Session): Promise<Sessions> {
  const sessions = await get()
  const newSessions = new Map([...sessions, [host, session]])
  return await set(newSessions).then(get)
}

/**
 * Remove sessions from storage.
 * @param hosts - Hosts that the sessions are associated with.
 * @returns Updated active sessions.
 * */
async function remove (...hosts: string[]): Promise<Sessions> {
  const sessions = await get()
  const newSessions = new Map(sessions)
  for (const host of hosts) {
    newSessions.delete(host)
  }
  return await set(newSessions).then(get)
}

const onChanged = new StorageChangeListener<Sessions>('sessions', get, ['local'])

/**
 * Clear all sessions.
 * @returns Updated active sessions (empty).
 * */
async function clear (): Promise<Sessions> {
  return await set(new Map([])).then(get)
}

export const actions = {
  add,
  remove,
  clear,
  fetch: get,
  onChanged
}
