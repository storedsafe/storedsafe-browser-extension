import { useState, useEffect } from 'react';

/**
 * Initialization action allowing for fetching the initial state asynchronously.
 * */
export interface InitAction {
  type: 'init';
}

/**
 * All reducer functions should implement this type.
 * @type {State} Type of the state the reducer presents.
 * @type {Action} Dispatch action presenting allowed parameters.
 * */
export type PromiseReducer<State, Action> = (
  state: State,
  action: Action | InitAction,
) => Promise<State>;

/**
 * Allow clients to listen to the state of their dispatch.
 * */
interface ActionListener<State> {
  onSuccess?: (state: State) => void;
  onError?: (error: Error) => void;
}

/**
 * @param {0} State
 * @param {1} Dispatch function
 * @param {2} Is initialized?
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
  const [promise, setPromise] = useState<Promise<State>>(Promise.resolve(emptyState));
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [state, setState] = useState<State>(emptyState);

  /**
   * Perfom asynchronous initialization.
   * */
  useEffect(() => {
    reducer(emptyState, { type: 'init' }).then((newState: State) => {
      setState(newState);
      setIsInitialized(true);
    });
  }, [reducer, emptyState]);

  /**
   * Dispatch actions to the reducer and call listener functions on
   * changes in promise state.
   * */
  const dispatch = (action: Action | InitAction, listener?: ActionListener<State>): void => {
    setPromise(promise.then((prevState) => {
      return reducer(state, action).then((newState: State) => {
        setState(newState);
        listener && listener.onSuccess && listener.onSuccess(newState);
        return newState;
      }).catch((error: Error) => {
        listener && listener.onError && listener.onError(error);
        return prevState;
      });
    }));
  };

  return {
    dispatch,
    state: state,
    isInitialized: isInitialized,
  };
}

export { usePromiseReducer };
export default PromiseReducer;
