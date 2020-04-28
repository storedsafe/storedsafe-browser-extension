import { PromiseReducer } from './PromiseReducer';
import * as Settings from '../model/Settings';

export interface State {
  settings: Settings.Settings;
}

export interface Action {
  type: 'set' | 'fetch';
  settings?: Settings.Settings;
}

export const reducer: PromiseReducer<State, Action> = (
  state,
  action
) => {
  switch (action.type) {
    case 'set': {
      return Settings.get().then((settings) => {
        const newSettings = {
          ...settings,
          ...action.settings,
        };
        return Settings.set(newSettings).then(() => ({ settings: newSettings }));
      })
    }
    case 'fetch': {
      return Settings.get().then((settings) => {
        return { settings }
      });
    }
    default: {
      throw new Error(`Invalid type: ${action.type}`);
    }
  }
};

export const emptyState: State = {
  settings: {},
};

export const init = (): Promise<State> => (
  reducer(emptyState, { type: 'fetch' })
);

