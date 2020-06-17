import { useState, useEffect, SetStateAction } from 'react';

/**
 * Initialization action allowing for fetching the initial state asynchronously.
 * */
export interface InitAction {
  type: 'init';
}

/**
 * All reducer functions should implement this type.
 * @type Dispatch action presenting allowed parameters.
 * @returns Promise of new state or function of old state.
 * */
export type PromiseReducer<State, Action> = (
  action: Action | InitAction,
) => Promise<State | SetStateAction<State>>;

/**
 * Allow clients to listen to the state of their dispatch.
 * */
interface ActionListener<State> {
  onSuccess?: (state: State) => void;
  onError?: (error: Error) => void;
}

/**
 * @param state - Current state of completed dispatches.
 * @param dispatch - Function to pass actions to reducers.
 * @param isInitialized True if first init dispatches are complete.
 * */
export type PromiseReducerHook<State, Action> = {
  state: State;
  dispatch: (
    action: Action | InitAction,
    listener?: ActionListener<State>
  ) => void;
  isInitialized: boolean;
};

/**
 * Asynchronous version of React's useReducer function.
 * @param {state.isInitialized} Whether or not all init actions have finished.
 * */
function usePromiseReducer<State, Action>(
  reducer: PromiseReducer<State, Action>,
  emptyState: State
): PromiseReducerHook<State, Action> {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [state, setState] = useState<State>(emptyState);

  /**
   * Perfom asynchronous initialization.
   * */
  useEffect(() => {
    reducer({ type: 'init' }).then((newState: State) => {
      setState(newState);
      setIsInitialized(true);
    });
  }, [reducer, emptyState]);

  /**
   * Dispatch actions to the reducer and call listener functions on
   * changes in promise state.
   * */
  const dispatch = (action: Action | InitAction, listener?: ActionListener<State>): void => {
    reducer(action).then((newState: State) => {
      if (newState instanceof Function) {
        listener && listener.onSuccess && listener.onSuccess(newState(state));
      } else {
        listener && listener.onSuccess && listener.onSuccess(newState);
      }
      setState(newState);
      return newState;
    }).catch((error: Error) => {
      listener && listener.onError && listener.onError(error);
      return state;
    });
  };

  return {
    dispatch,
    state: state,
    isInitialized: isInitialized,
  };
}

export { usePromiseReducer };
export default PromiseReducer;
