import { PromiseReducer } from './PromiseReducer';
import * as SettingsReducer from './SettingsReducer';
import * as SitesReducer from './SitesReducer';
import * as SessionsReducer from './SessionsReducer';
import * as SitePrefsReducer from './SitePrefsReducer';

type AreaAction =
  SettingsReducer.Action
| SitesReducer.Action
| SessionsReducer.Action
| SitePrefsReducer.Action;

export interface State extends
SettingsReducer.State,
SitesReducer.State,
SessionsReducer.State,
SitePrefsReducer.State
{}

export interface Action {
  type?: 'init' | 'actions';
  settings?: SettingsReducer.Action;
  sites?: SitesReducer.Action;
  sessions?: SessionsReducer.Action;
  sitePrefs?: SitePrefsReducer.Action;
}

export const reducer: PromiseReducer<State, Action> = (
  state,
  { type = 'actions', ...action }: Action
) => {
  let settingsPromise, sitesPromise, sessionsPromise, sitePrefsPromise;
  if (type === 'init') {
    settingsPromise = SettingsReducer.init();
    sitesPromise = SitesReducer.init();
    sessionsPromise = SessionsReducer.init();
    sitePrefsPromise = SitePrefsReducer.init();
  } else {
    settingsPromise = action.settings && SettingsReducer.reducer(state, action.settings);
    sitesPromise = action.sites && SitesReducer.reducer(state, action.sites);
    sessionsPromise = action.sessions && SessionsReducer.reducer(state, action.sessions);
    sitePrefsPromise = action.sitePrefs && SitePrefsReducer.reducer(state, action.sitePrefs);
  }

  return Promise.all([
    settingsPromise,
    sitesPromise,
    sessionsPromise,
    sitePrefsPromise
  ]).then(([
    settings,
    sites,
    sessions,
    sitePrefs
  ]) => ({
    ...settings,
    ...sites,
    ...sessions,
    ...sitePrefs,
  }));
};

export const emptyState = {
  ...SettingsReducer.emptyState,
  ...SitesReducer.emptyState,
  ...SessionsReducer.emptyState,
  ...SitePrefsReducer.emptyState,
};
