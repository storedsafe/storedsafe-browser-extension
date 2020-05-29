import PromiseReducer from './PromiseReducer';
import { actions, SitePrefs } from '../model/SitePrefs';
import { LoginType } from '../model/StoredSafe';

export type State = SitePrefs;
export type Action = {
  type: 'update';
  url: string;
  username: string;
  loginType: LoginType;
} | {
  type: 'remove';
  url: string;
};

export const reducer: PromiseReducer<State, Action> = (count, action) => {
  switch(action.type) {
    case 'update': {
      const { url, username, loginType } = action;
      return actions.update(url, username, loginType);
    }
    case 'init': {
      return actions.fetch();
    }
  }
};

export const emptyState: State = { sites: {} };
