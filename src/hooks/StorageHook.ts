import * as React from 'react';
import * as AuthState from '../model/AuthState';
import * as Sessions from '../model/Sessions';
import * as Settings from '../model/Settings';
import * as Sites from '../model/Sites';

type Action = 'INIT' | 'SUCCESS' | 'FAILURE';
type Loader = 'AuthState' | 'Sessions' | 'Settings' | 'Sites';

interface ReducerAction {
  type: Action;
  loader: Loader;
  errors?: string[];
}

interface LoaderState {
  isLoading: boolean;
  hasErrors: boolean;
}

type StorageState = {
  [loader in Loader]: LoaderState;
}

export interface StorageFields {
  authState: AuthState.AuthState;
  sessions: Sessions.Sessions;
  settings: Settings.Settings;
  sites: Sites.SiteCollection;
}

export interface StorageMutators {
  fetchAuthState: () => void;
  fetchSessions: () => void;
  fetchSettings: () => void;
  fetchSites: () => void;
  fetchAll: () => void;
  updateAuthState: (authState: AuthState.AuthState) => void;
  updateSessions: (sessions: Sessions.Sessions) => void;
  updateSettings: (settings: Settings.Settings) => void;
  updateSites: (siteCollection: Sites.SiteCollection) => void;
}

export type StorageHook = [StorageFields, StorageMutators, StorageState];

const storageReducer = (state: StorageState, action: ReducerAction): StorageState => {
  switch(action.type) {
    case 'INIT': {
      return {
        ...state,
        [action.loader]: {
          isLoading: true,
          hasErrors: false,
          errors: [],
        }
      };
    }
    case 'SUCCESS': {

      return {
        ...state,
        [action.loader]: {
          isLoading: false,
          hasErrors: false,
          errors: [],
        }
      };
    }
    case 'FAILURE': {
      return {
        ...state,
        [action.loader]: {
          isLoading: false,
          hasErrors: true,
          errors: action.errors || [],
        }
      };
    }
    default: {
      throw new Error(`Invalid action type: ${action.type}`);
    }
  }
}

const defaultLoaderState: LoaderState = {
  isLoading: false,
  hasErrors: false,
}

const defaultState: StorageState = {
  AuthState: defaultLoaderState,
  Sessions: defaultLoaderState,
  Settings: defaultLoaderState,
  Sites: defaultLoaderState,
}

export const useStorage = (): StorageHook => {
  const [state, dispatch] = React.useReducer(storageReducer, defaultState);
  const [authState, setAuthState] = React.useState<AuthState.AuthState>({ usernames: {} });
  const [sessions, setSessions] = React.useState<Sessions.Sessions>({});
  const [settings, setSettings] = React.useState<Settings.Settings>({});
  const [sites, setSites] = React.useState<Sites.SiteCollection>({ system: [], user: [] });

  const fetchAuthState = (): void => {
    dispatch({ type: 'INIT', loader: 'AuthState' });
    AuthState.get().then((newAuthState) => {
      dispatch({ type: 'SUCCESS', loader: 'AuthState' });
      setAuthState(newAuthState)
    }).catch(() => dispatch({ type: 'FAILURE', loader: 'AuthState' }));
  };

  const fetchSessions = (): void => {
    dispatch({ type: 'INIT', loader: 'Sessions' });
    Sessions.get().then((newSessions) => {
      dispatch({ type: 'SUCCESS', loader: 'Sessions' });
      setSessions(newSessions)
    }).catch(() => dispatch({ type: 'FAILURE', loader: 'Sessions' }));
  };

  const fetchSettings = (): void => {
    dispatch({ type: 'INIT', loader: 'Settings' });
    Settings.get().then((newSettings) => {
      dispatch({ type: 'SUCCESS', loader: 'Settings' });
      setSettings(newSettings)
    }).catch(() => dispatch({ type: 'FAILURE', loader: 'Settings' }));
  };

  const fetchSites = (): void => {
    dispatch({ type: 'INIT', loader: 'Sites' });
    Sites.get().then((newSites) => {
      dispatch({ type: 'SUCCESS', loader: 'Sites' });
      setSites(newSites)
    }).catch(() => dispatch({ type: 'FAILURE', loader: 'Sites' }));
  };

  const updateAuthState = (authState: AuthState.AuthState): void => {
    dispatch({ type: 'INIT', loader: 'AuthState' });
    AuthState.set(authState).then(() => {
      dispatch({ type: 'SUCCESS', loader: 'AuthState' });
      setAuthState(authState)
    }).catch(() => dispatch({ type: 'FAILURE', loader: 'AuthState' }));
  };

  const updateSessions = (sessions: Sessions.Sessions): void => {
    dispatch({ type: 'INIT', loader: 'Sessions' });
    Sessions.set(sessions).then(() => {
      dispatch({ type: 'SUCCESS', loader: 'Sessions' });
      setSessions(sessions)
    }).catch(() => dispatch({ type: 'FAILURE', loader: 'Sessions' }));
  };

  const updateSettings = (settings: Settings.Settings): void => {
    dispatch({ type: 'INIT', loader: 'Settings' });
    Settings.set(settings).then(() => {
      dispatch({ type: 'SUCCESS', loader: 'Settings' });
      setSettings(settings)
    }).catch(() => dispatch({ type: 'FAILURE', loader: 'Settings' }));
  };

  const updateSites = (siteCollection: Sites.SiteCollection): void => {
    dispatch({ type: 'INIT', loader: 'Sites' });
    Sites.set(siteCollection).then(() => {
      dispatch({ type: 'SUCCESS', loader: 'Sites' });
      setSites(siteCollection)
    }).catch(() => dispatch({ type: 'FAILURE', loader: 'Sites' }));
  };

  const fetchAll = (): void => {
    fetchAuthState();
    fetchSessions();
    fetchSettings();
    fetchSites();
  };

  React.useEffect(() => {

  });

  return [{
    authState,
    sessions,
    settings,
    sites,
  }, {
    fetchAuthState,
    fetchSessions,
    fetchSettings,
    fetchSites,
    fetchAll,
    updateAuthState,
    updateSessions,
    updateSettings,
    updateSites,
  }, state];
};
