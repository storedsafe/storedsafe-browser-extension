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
  sites:  SitesReducer.State;
  sitePrefs:  SitePrefsReducer.State;
  search:  SearchReducer.State;
}

export type Action = {
  type?: 'dispatch';
  sessions?: SessionsReducer.Action;
  settings?: SettingsReducer.Action;
  sites?: SitesReducer.Action;
  sitePrefs?: SitePrefsReducer.Action;
  search?: SearchReducer.Action;
};

export const reducer: PromiseReducer<State, Action> = (action) => {
  if (action.type === 'init') {
    return Promise.all([
      SessionsReducer.reducer({ type: 'init' }),
      SettingsReducer.reducer({ type: 'init' }),
      SitesReducer.reducer({ type: 'init' }),
      SitePrefsReducer.reducer({ type: 'init' }),
      SearchReducer.reducer({ type: 'init' }),
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
    return Promise.all<SetStateAction<AreaState | void>>([
      sessions, settings, sites, sitePrefs, search,
    ]).then(([sessions, settings, sites, sitePrefs, search]) => {
      return (prevState: State): State => {
        sessions = (sessions || prevState.sessions) as SessionsReducer.State;
        settings = (settings || prevState.settings) as SettingsReducer.State;
        sites = (sites || prevState.sites) as SitesReducer.State;
        sitePrefs = (sitePrefs || prevState.sitePrefs) as SitePrefsReducer.State;
        search = (search || prevState.search) as SearchReducer.State;
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
