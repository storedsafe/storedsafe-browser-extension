export interface Session {
  apikey: string;
  token: string;
  createdAt: number;
  lastActive: number;
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
export const get = (): Promise<Sessions> => (
  browser.storage.local.get('sessions')
  .then(({ sessions }) => {
    if (sessions) {
      return sessions || {};
    }
    return {};
  })
)

/**
 * Commit Sessions object to sync storage.
 * @param sessions New Sessions object.
 * */
export const set = (sessions: Sessions): Promise<void> => {
  return browser.storage.local.set({ sessions });
}
