export interface Session {
  apikey: string;
  token: string;
  createdAt: number;
}

/**
 * Sessions object.
 * */
export interface Sessions {
  [url: string]: Session;
}

/**
 * Get sessions from local storage.
 * @return Sessions Promise containing Sessions object.
 * */
const get = (): Promise<Sessions> => (
  browser.storage.local.get('sessions')
  .then(({ sessions }) => {
    return sessions || {};
  })
)

/**
 * Commit Sessions object to sync storage.
 * @param sessions New Sessions object.
 * */
const set = (sessions: Sessions): Promise<void> => {
  return browser.storage.local.set({ sessions });
}

export const actions = {
  /**
   * Add new session to storage.
   * */
  add: (url: string, session: Session): Promise<Sessions> => {
    return get().then((sessions) => {
      const newSessions = {
        ...sessions,
        [url]: session,
      };
      return set(newSessions).then(() => get());
    })
  },

  /**
   * Remove session from storage.
   * */
  remove: (url: string): Promise<Sessions> => {
    return get().then((sessions) => {
      const urls = Object.keys(sessions).filter((sessionUrl) => sessionUrl !== url);
      const newSessions: Sessions = {};
      urls.forEach((url) => newSessions[url] = sessions[url]);
      return set(newSessions).then(() => get());
    });
  },

  /**
   * Clear all sessions.
   * */
  clear: (): Promise<Sessions> => {
    return set({}).then(() => get());
  },

  /**
   * Fetch sessions from storage.
   * */
  fetch: get,
};
