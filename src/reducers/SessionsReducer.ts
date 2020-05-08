import PromiseReducer from './PromiseReducer';
import { actions, Sessions, Session } from '../model/Sessions';

export type State = Sessions;
export type Action = {
  type: 'add';
  url: string;
  session: Session;
} | {
  type: 'remove';
  url: string;
};

export const reducer: PromiseReducer<State, Action> = (state, action) => {
  switch(action.type) {
    case 'add': {
      const { url, session } = action;
      return actions.add(url, session);
    }
    case 'remove': {
      const { url } = action;
      return actions.remove(url);
    }
    case 'init': {
      return actions.fetch();
    }
  }
};


export const emptyState: State = {};
