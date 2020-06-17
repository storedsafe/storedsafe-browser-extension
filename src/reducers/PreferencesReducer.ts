import PromiseReducer from './PromiseReducer';
import { actions } from '../model/storage/Preferences';

export type State = Preferences;
export type Action = {
  type: 'update';
  host: string;
  sitePreferences: SitePreferences;
} | {
  type: 'remove';
  host: string;
};

export const reducer: PromiseReducer<State, Action> = (action) => {
  switch(action.type) {
    case 'update': {
      const { host, sitePreferences } = action;
      return actions.updateSitePreferences(host, sitePreferences);
    }
    case 'init': {
      return actions.fetch();
    }
  }
};

export const emptyState: State = { sites: {} };
