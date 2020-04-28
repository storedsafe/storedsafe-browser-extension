export interface Usernames {
  [url: string]: string;
}

export interface AuthState {
  usernames: Usernames;
  selected?: string;
}

/**
 * Get settings related to the Auth component from local storage.
 * @return AuthState Promise containing AuthState object.
 * */
export const get = (): Promise<AuthState> => (
  browser.storage.local.get('authState').then(({ authState }) => {
    if (authState) {
      const { usernames, selected } = authState;
      return {
        usernames: usernames || {},
        selected,
      };
    }
    return { usernames: {} }
  })
);

/**
 * Commit AuthState object to local storage.
 * @param authState New AuthState object.
 * */
export const set = (authState: AuthState): Promise<void> => (
  browser.storage.local.set({ authState })
);
