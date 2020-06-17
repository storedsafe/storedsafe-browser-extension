import { SetStateAction } from 'react';
import PromiseReducer from './PromiseReducer';
import * as SessionsReducer from './SessionsReducer';
import * as SettingsReducer from './SettingsReducer';
import * as SitesReducer from './SitesReducer';
import * as SitePrefsReducer from './SitePrefsReducer';
import * as SearchReducer from './SearchReducer';

type AreaState = (
  SessionsReducer.State |
  SettingsReducer.State |
  SitesReducer.State |
  SitePrefsReducer.State |
  SearchReducer.State
);

export type State = {
  sessions: SessionsReducer.State;
  settings: SettingsReducer.State;
  sites: SitesReducer.State;
  sitePrefs: SitePrefsReducer.State;
  search: SearchReducer.State;
}

export type Action = {
  type?: 'dispatch';
  sessions?: SessionsReducer.Action;
  settings?: SettingsReducer.Action;
  sites?: SitesReducer.Action;
  sitePrefs?: SitePrefsReducer.Action;
  search?: SearchReducer.Action;
};

const parseState = <T>(
  state: unknown | SetStateAction<unknown> | void,
  prevState: T
): T => {
  if (state) {
    state = state as T | SetStateAction<T>;
    if (state instanceof Function) {
      return state(prevState) as T;
    } else {
      return state as T;
    }
  } else {
    return prevState;
  }
};

export const reducer: PromiseReducer<State, Action> = (action) => {
  if (action.type === 'init') {
    return Promise.all<Sessions, Settings, Sites, Preferences, Results>([
      SessionsReducer.reducer({ type: 'init' }) as Promise<Sessions>,
      SettingsReducer.reducer({ type: 'init' }) as Promise<Settings>,
      SitesReducer.reducer({ type: 'init' }) as Promise<Sites>,
      SitePrefsReducer.reducer({ type: 'init' }) as Promise<Preferences>,
      SearchReducer.reducer({ type: 'init' }) as Promise<Results>,
    ]).then(([sessions, settings, sites, sitePrefs, search]) => ({
      sessions, settings, sites, sitePrefs, search,
    }));
  } else {
    const sessions = (
      action.sessions
        ? SessionsReducer.reducer(action.sessions)
        : Promise.resolve()
    );
    const settings = (
      action.settings
      ? SettingsReducer.reducer(action.settings)
      : Promise.resolve()
    );
    const sites = (
      action.sites
      ? SitesReducer.reducer(action.sites)
      : Promise.resolve()
    );
    const sitePrefs = (
      action.sitePrefs
      ? SitePrefsReducer.reducer(action.sitePrefs)
      : Promise.resolve()
    );
    const search = (
      action.search
      ? SearchReducer.reducer(action.search)
      : Promise.resolve()
    );

    return Promise.all<AreaState | SetStateAction<AreaState> | void>([
      sessions, settings, sites, sitePrefs, search,
    ]).then(([sessions, settings, sites, sitePrefs, search]) => {
      return (prevState: State): State => {
        sessions = parseState<Sessions>(sessions, prevState.sessions);
        settings = parseState<Settings>(settings, prevState.settings);
        sites = parseState<Sites>(sites, prevState.sites);
        sitePrefs = parseState<Preferences>(sitePrefs, prevState.sitePrefs);
        search = parseState<Results>(search, prevState.search);
        return {
          sessions, settings, sites, sitePrefs, search,
        }
      };
    });
  }
};

export const emptyState: State = {
  sessions: SessionsReducer.emptyState,
  settings: SettingsReducer.emptyState,
  sites: SitesReducer.emptyState,
  sitePrefs: SitePrefsReducer.emptyState,
  search: SearchReducer.emptyState,
};
