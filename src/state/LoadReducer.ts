import { useReducer } from 'react';

export const defaultState = {
  isLoading: true,
  hasError: false,
};

export interface State {
  isLoading: boolean;
  hasError: boolean;
  error?: Error;
}

export interface Action {
  type: 'init' | 'success' | 'error';
  error?: Error;
}

export const reducer = (state: State, action: Action): State => {
  switch(action.type) {
    case 'init': {
      return {
        isLoading: true,
        hasError: false,
      }
    }
    case 'success': {
      return {
        isLoading: false,
        hasError: false,
      }
    }
    case 'error': {
      return {
        isLoading: false,
        hasError: true,
        error: action.error,
      }
    }
    default: {
      throw new Error(`Invalid action: ${action}`);
    }
  }
}

export const useLoadReducer = (): [State, React.Dispatch<Action>] => useReducer(
  reducer,
  defaultState,
);

