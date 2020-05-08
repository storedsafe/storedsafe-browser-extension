import PromiseReducer from './PromiseReducer';
import { actions, Sites, Site } from '../model/Sites';

export type State = Sites;
export type Action = {
  type: 'add';
  site: Site;
} | {
  type: 'remove';
  id: number;
};

export const reducer: PromiseReducer<State, Action> = (count, action) => {
  switch(action.type) {
    case 'add': {
      const { site } = action;
      return actions.add(site);
    }
    case 'remove': {
      const { id } = action;
      return actions.remove(id);
    }
    case 'init': {
      return actions.fetch();
    }
  }
};

export const emptyState: State = {
  list: [],
  collections: {
    system: [],
    user: []
  }
};
