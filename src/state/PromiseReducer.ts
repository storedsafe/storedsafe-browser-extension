import { useState, useCallback, useEffect } from 'react';

export const defaultLoadState = {
  isInitialized: false,
  isLoading: true,
  hasError: false,
};

export interface LoadState {
  isInitialized: boolean;
  isLoading: boolean;
  hasError: boolean;
  error?: Error;
}

export type PromiseState<State> = State & LoadState;

export type PromiseReducer<State, Action> = (
  state: State,
  action: Action,
) => Promise<State>;

type PromiseDispatch<Action> = (
  action: Action,
) => void;

type PromiseHook<State, Action> = [
  PromiseState<State>,
  PromiseDispatch<Action>,
]

export const usePromiseReducer = <State, Action>(
  emptyState: State,
  getInitialState: () => Promise<State>,
  reducer: PromiseReducer<State, Action>,
): PromiseHook<State, Action> => {
  const [state, setState] = useState<PromiseState<State>>({
    ...emptyState,
    ...defaultLoadState,
  });

  const handlePromise = useCallback((promise: Promise<State>): void => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true,
      hasError: false,
    }));
    promise.then((newState: State) => {
      setState((prevState) => ({
        ...prevState,
        ...newState,
        isInitialized: true,
        isLoading: false,
        hasError: false,
      }));
    }).catch((error) => setState((prevState) => ({
      ...prevState,
      isLoading: false,
      hasError: true,
      error,
    })));
  }, []);

  useEffect(() => {
    handlePromise(getInitialState());
  }, [handlePromise, getInitialState]);

  const dispatch: PromiseDispatch<Action> = useCallback((
    action: Action
  ) => {
    handlePromise(reducer(state, action));
  }, [handlePromise, reducer, state]);

  return [{
    ...state,
  }, dispatch];
};
