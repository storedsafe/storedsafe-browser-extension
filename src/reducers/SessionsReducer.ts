import PromiseReducer from './PromiseReducer';
import { actions } from '../model/storage/Sessions';
import { actions as storedsafe } from '../model/storedsafe/StoredSafe';

export type State = Sessions;
export type Action = {
  type: 'login';
  site: Site;
  fields: LoginFields;
} | {
  type: 'logout';
  host: string;
};

export const reducer: PromiseReducer<State, Action> = (action) => {
  switch(action.type) {
    case 'login': {
      const { site, fields } = action;
      return storedsafe.login(site, fields);
    }
    case 'logout': {
      const { host } = action;
      return storedsafe.logout(host);
    }
    case 'init': {
      return actions.fetch();
    }
  }
};


export const emptyState: State = new Map();
