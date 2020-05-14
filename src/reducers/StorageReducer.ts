import PromiseReducer from './PromiseReducer';
import * as SessionsReducer from './SessionsReducer';
import * as SettingsReducer from './SettingsReducer';
import * as SitesReducer from './SitesReducer';
import * as SitePrefsReducer from './SitePrefsReducer';
import * as SearchReducer from './SearchReducer';

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

export const reducer: PromiseReducer<State, Action> = (state, action) => {
  const promises = {
    sessions: Promise.resolve(state.sessions),
    settings: Promise.resolve(state.settings),
    sites: Promise.resolve(state.sites),
    sitePrefs: Promise.resolve(state.sitePrefs),
    search: Promise.resolve(state.search),
  };

  if (action.type === 'init') {
    promises.sessions = SessionsReducer.reducer(
      state.sessions, { type: 'init' }
    );
    promises.settings = SettingsReducer.reducer(
      state.settings, { type: 'init' }
    );
    promises.sites = SitesReducer.reducer(
      state.sites, { type: 'init' }
    );
    promises.sitePrefs = SitePrefsReducer.reducer(
      state.sitePrefs, { type: 'init' }
    );
    promises.search = SearchReducer.reducer(
      state.search, { type: 'init' }
    );
  } else {
    if (action.sessions) {
      promises.sessions = SessionsReducer.reducer(
        state.sessions, action.sessions,
      );
    }
    if (action.settings) {
      promises.settings = SettingsReducer.reducer(
        state.settings, action.settings,
      );
    }
    if (action.sites) {
      promises.sites = SitesReducer.reducer(
        state.sites, action.sites,
      );
    }
    if (action.sitePrefs) {
      promises.sitePrefs = SitePrefsReducer.reducer(
        state.sitePrefs, action.sitePrefs,
      );
    }
    if (action.search) {
      promises.search = SearchReducer.reducer(
        state.search, action.search,
      );
    }
  }

  return Promise.all([
    promises.sessions,
    promises.settings,
    promises.sites,
    promises.sitePrefs,
    promises.search,
  ]).then(([sessions, settings, sites, sitePrefs, search]) => ({
    sessions, settings, sites, sitePrefs, search,
  }));
};

export const emptyState: State = {
  sessions: SessionsReducer.emptyState,
  settings: SettingsReducer.emptyState,
  sites: SitesReducer.emptyState,
  sitePrefs: SitePrefsReducer.emptyState,
  search: SearchReducer.emptyState,
};
