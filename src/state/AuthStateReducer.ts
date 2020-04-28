import { PromiseReducer } from './PromiseReducer';
import * as AuthState from '../model/AuthState';

export interface State {
  authState: AuthState.AuthState;
}

export interface Action {
  type: 'addUsername' | 'setSelected' | 'fetch';
  url?: string;
  username?: string;
}

export const reducer: PromiseReducer<State, Action> = (
  state,
  action
) => {
  switch (action.type) {
    case 'addUsername': {
      return AuthState.get().then((authState) => {
        const newAuthState = {
          ...authState,
          usernames: {
            ...authState.usernames,
            [action.url]: action.username,
          },
        };
        return AuthState.set(newAuthState).then(() => ({ authState: newAuthState }));
      })
    }
    case 'setSelected': {
      return AuthState.get().then((authState) => {
        const newAuthState = {
          ...authState,
          selected: action.url,
        };
        return AuthState.set(newAuthState).then(() => ({ authState: newAuthState }));
      });
    }
    case 'fetch': {
      return AuthState.get().then((authState) => {
        return { authState }
      });
    }
    default: {
      throw new Error(`Invalid type: ${action.type}`);
    }
  }
};

export const emptyState: State = {
  authState: { usernames: {} },
};

export const init = (): Promise<State> => (
  reducer(emptyState, { type: 'fetch' })
);

