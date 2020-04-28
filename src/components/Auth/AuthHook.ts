import { useState } from 'react';
import * as Sites from '../../model/Sites';
import * as Sessions from '../../model/Sessions';
import * as AuthState from '../../model/AuthState';

export type AddSession = (url: string, session: Sessions.Session) => Promise<void>;
export type RemoveSession = (url: string) => Promise<void>;
export type AddUsername = (url: string, username: string) => Promise<void>;
export type RemoveUsername = (url: string) => Promise<void>;

export interface StorageState {
  sites: Sites.Site[];
  sessions: Sessions.Sessions;
  authState: AuthState.AuthState;
}

export interface AuthHook {
  state: StorageState;
  addSession: AddSession;
  removeSession: RemoveSession;
  addUsername: AddUsername;
  removeUsername: RemoveUsername;
  fetchStateFromStorage(): Promise<void>;
}

export const useAuth = (): AuthHook => {
  const [state, setState] = useState<StorageState>(undefined);

  const addSession = (url: string, session: Sessions.Session): Promise<void> => (
    Sessions.get().then((sessions) => {
      const newSessions: Sessions.Sessions = {
        ...sessions,
        [url]: session,
      }
      return Sessions.set(newSessions).then(() => {
        setState({ ...state, sessions: newSessions })
      });
    })
  );

  const removeSession = (url: string): Promise<void> => (
    Sessions.get().then((sessions) => {
      if (sessions[url] === undefined) return;
      const newSessions: Sessions.Sessions = {};
      const keys = Object.keys(sessions).filter((key) => key !== url);
      keys.forEach((key) => newSessions[key] = sessions[key]);
      return Sessions.set(newSessions).then(() => {
        setState({ ...state, sessions: newSessions })
      });
    })
  );

  const addUsername = (url: string, username: string): Promise<void> => (
    AuthState.get().then((authState) => {
      const newAuthState: AuthState.AuthState = {
        ...authState,
        usernames: {
          ...authState.usernames,
          [url]: username,
        },
      };
      return AuthState.set(newAuthState).then(() => {
        setState({ ...state, authState: newAuthState });
      });
    })
  );

  const removeUsername = (url: string): Promise<void> => (
    AuthState.get().then((authState) => {
      if (authState.usernames[url] === undefined) return;
      const { usernames } = authState;
      const newUsernames: AuthState.Usernames = {};
      const keys = Object.keys(usernames).filter((key) => key !== url);
      keys.forEach((key) => newUsernames[key] = usernames[key]);
      const newAuthState: AuthState.AuthState = {
        ...authState,
        usernames,
      };
      return AuthState.set(newAuthState).then(() => {
        setState({ ...state, authState: newAuthState });
      });
    })
  );

  const fetchStateFromStorage = (): Promise<void> => {
    const sitePromise = Sites.get();
    const sessionPromise = Sessions.get();
    const authStatePromise = AuthState.get();
    return Promise.all([
      sitePromise, sessionPromise, authStatePromise
    ]).then(([{ system, user }, sessions, authState]) => {
      const sites = system.concat(user);
      setState({
        sites, sessions, authState,
      });
    });
  };

  return {
    state,
    addSession,
    removeSession,
    addUsername,
    removeUsername,
    fetchStateFromStorage,
  };
}

