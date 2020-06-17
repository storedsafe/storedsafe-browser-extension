/**
 * Abstraction layer for browser storage API to handle persisting StoredSafe
 * sessions as a means of indicating whether a user is logged into a site or
 * not. The extension background script is expected to set/clear this storage
 * area as a user performs a login/logout action or when a session times out.
 * - get/set functions handle all storage interaction.
 * - actions object provides the public interface for the model.
 * */

/**
 * Get sessions from local storage.
 * @returns Promise containing all currently active sessions.
 * */
const get = (): Promise<Sessions> => (
  browser.storage.local.get('sessions')
  .then(({ sessions }) => {
    return new Map(sessions || []);
  })
)

/**
 * Commit Sessions object to sync storage.
 * @param sessions - All currently active sessions.
 * @returns Empty promise.
 * */
const set = (sessions: Sessions): Promise<void> => (
  browser.storage.local.set({
    sessions: Array.from(sessions),
  })
)

export const actions = {
  /**
   * Add new session to storage.
   * @param host - Host that the session is associated with.
   * @param session - New session data.
   * @returns Updated active sessions.
   * */
  add: (host: string, session: Session): Promise<Sessions> => (
    get().then((sessions) => {
      const newSessions = new Map([...sessions, [host, session]]);
      return set(newSessions).then(get);
    })
  ),

  /**
   * Remove sessions from storage.
   * @param hosts - Hosts that the sessions are associated with.
   * @returns Updated active sessions.
   * */
  remove: (...hosts: string[]): Promise<Sessions> => (
    get().then((sessions) => {
      const newSessions = new Map(sessions);
      for (const host of hosts) {
        newSessions.delete(host);
      }
      return set(newSessions).then(get);
    })
  ),

  /**
   * Clear all sessions.
   * @returns Updated active sessions (empty).
   * */
  clear: (): Promise<Sessions> => (
    set(new Map([])).then(get)
  ),

  /**
   * Fetch sessions from storage.
   * @returns All active sessions.
   * */
  fetch: get,
};
