import PromiseReducer from './PromiseReducer';
import * as SessionsReducer from './SessionsReducer';
import * as SettingsReducer from './SettingsReducer';
import * as SitesReducer from './SitesReducer';
import * as SitePrefsReducer from './SitePrefsReducer';

export type State = {
  sessions: SessionsReducer.State;
  settings: SettingsReducer.State;
  sites:  SitesReducer.State;
  sitePrefs:  SitePrefsReducer.State;
}

export type Action = {
  type?: 'dispatch';
  sessions?: SessionsReducer.Action;
  settings?: SettingsReducer.Action;
  sites?: SitesReducer.Action;
  sitePrefs?: SitePrefsReducer.Action;
};

export const reducer: PromiseReducer<State, Action> = (state, action) => {
  const promises = {
    sessions: Promise.resolve(state.sessions),
    settings: Promise.resolve(state.settings),
    sites: Promise.resolve(state.sites),
    sitePrefs: Promise.resolve(state.sitePrefs),
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
  }

  return Promise.all([
    promises.sessions,
    promises.settings,
    promises.sites,
    promises.sitePrefs,
  ]).then(([sessions, settings, sites, sitePrefs]) => ({
    sessions, settings, sites, sitePrefs,
  }));
};

export const emptyState: State = {
  sessions: SessionsReducer.emptyState,
  settings: SettingsReducer.emptyState,
  sites: SitesReducer.emptyState,
  sitePrefs: SitePrefsReducer.emptyState,
};
