import { PromiseReducer } from './PromiseReducer';
import * as SitePrefs from '../model/SitePrefs';

export interface State {
  sitePrefs: SitePrefs.SitePrefs;
}

export interface Action {
  type: 'update' | 'fetch';
  url?: string;
  username?: string;
  loginType?: 'yubikey' | 'totp';
}

export const reducer: PromiseReducer<State, Action> = (
  state,
  action
) => {
  switch (action.type) {
    case 'update': {
      return SitePrefs.get().then((sitePrefs) => {
        const { url, username, loginType } = action;
        const urlSitePrefs = (
          username !== undefined
          || loginType !== undefined
        ) ? { [url]: { username, loginType } } : {};
        const newSitePrefs = {
          ...sitePrefs,
          ...urlSitePrefs,
        };
        return SitePrefs.set(newSitePrefs).then(() => ({ sitePrefs: newSitePrefs }));
      })
    }

    case 'fetch': {
      return SitePrefs.get().then((sitePrefs) => {
        return { sitePrefs }
      });
    }

    default: {
      throw new Error(`Invalid type: ${action.type}`);
    }
  }
};

export const emptyState: State = {
  sitePrefs: {},
};

export const init = (): Promise<State> => (
  reducer(emptyState, { type: 'fetch' })
);

