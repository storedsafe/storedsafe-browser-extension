import PromiseReducer from './PromiseReducer';
import { Session } from '../model/Sessions';
import { actions, SearchResults } from '../model/Search';
import { actions as storedsafe } from '../model/StoredSafe';

export type State = SearchResults;
export type Action = {
  type: 'find';
  needle: string;
  url: string;
  session: Session;
} | {
  type: 'decrypt';
  url: string;
  id: number;
  session: Session;
};

export const reducer: PromiseReducer<State, Action> = (state, action) => {
  switch(action.type) {
    case 'find': {
      const { needle, url, session } = action;
      return storedsafe.searchFind(needle, url, session);
    }
    case 'decrypt': {
      const { url, id, session } = action;
      return storedsafe.searchDecrypt(url, id, session);
    }
    case 'init': {
      return actions.fetch();
    }
  }
};


export const emptyState: State = {};
