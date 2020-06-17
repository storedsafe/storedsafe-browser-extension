import PromiseReducer from './PromiseReducer';
import { actions } from '../model/storage/Settings';

export type State = Settings;
export type Action = {
  type: 'update';
  settings: Settings;
};

export const reducer: PromiseReducer<State, Action> = (action) => {
  switch(action.type) {
    case 'update': {
      const { settings } = action;
      return actions.update(settings);
    }
    case 'init': {
      return actions.fetch();
    }
  }
};

export const emptyState: State = new Map();
