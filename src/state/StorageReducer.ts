import { PromiseReducer } from './PromiseReducer';
import * as SettingsReducer from './SettingsReducer';
import * as SitesReducer from './SitesReducer';
import * as SessionsReducer from './SessionsReducer';
import * as AuthStateReducer from './AuthStateReducer';

type AreaAction =
  SettingsReducer.Action
| SitesReducer.Action
| SessionsReducer.Action
| AuthStateReducer.Action;

export interface State extends
SettingsReducer.State,
SitesReducer.State,
SessionsReducer.State,
AuthStateReducer.State
{}

export interface Action {
  type?: 'init' | 'actions';
  settings?: SettingsReducer.Action;
  sites?: SitesReducer.Action;
  sessions?: SessionsReducer.Action;
  authState?: AuthStateReducer.Action;
}

export const reducer: PromiseReducer<State, Action> = (
  state,
  { type = 'actions', ...action }: Action
) => {
  let settingsPromise, sitesPromise, sessionsPromise, authStatePromise;
  if (type === 'init') {
    settingsPromise = SettingsReducer.init();
    sitesPromise = SitesReducer.init();
    sessionsPromise = SessionsReducer.init();
    authStatePromise = AuthStateReducer.init();
  } else {
    settingsPromise = action.settings && SettingsReducer.reducer(state, action.settings);
    sitesPromise = action.sites && SitesReducer.reducer(state, action.sites);
    sessionsPromise = action.sessions && SessionsReducer.reducer(state, action.sessions);
    authStatePromise = action.authState && AuthStateReducer.reducer(state, action.authState);
  }

  return Promise.all([
    settingsPromise,
    sitesPromise,
    sessionsPromise,
    authStatePromise
  ]).then(([
    settings,
    sites,
    sessions,
    authState
  ]) => ({
    ...settings,
    ...sites,
    ...sessions,
    ...authState,
  }));
};

export const emptyState = {
  ...SettingsReducer.emptyState,
  ...SitesReducer.emptyState,
  ...SessionsReducer.emptyState,
  ...AuthStateReducer.emptyState,
};
