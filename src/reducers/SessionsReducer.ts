import PromiseReducer from './PromiseReducer';
import { actions, Sessions, Session } from '../model/Sessions';
import { Site } from '../model/Sites';
import { actions as storedsafe, LoginFields } from '../model/StoredSafe';

export type State = Sessions;
export type Action = {
  type: 'login';
  site: Site;
  fields: LoginFields;
} | {
  type: 'logout';
  url: string;
  session: Session;
};

export const reducer: PromiseReducer<State, Action> = (state, action) => {
  switch(action.type) {
    case 'login': {
      const { site, fields } = action;
      return storedsafe.login(site, fields);
    }
    case 'logout': {
      const { url, session } = action;
      return storedsafe.logout(url, session);
    }
    case 'init': {
      return actions.fetch();
    }
  }
};


export const emptyState: State = {};
