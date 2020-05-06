import React, { createContext, useContext } from 'react';
import {
  PromiseState,
  PromiseReducer,
  usePromiseReducer,
  defaultLoadState,
} from './PromiseReducer';

type StateContext<State, Action> = [State, (action: Action) => void];

interface StateProviderProps {
  children: React.ReactNode;
}

type CreateState = <State, Action>(
  emptyState: State,
  getInitialState: () => Promise<State>,
  reducer: PromiseReducer<State, Action>,
  mockReducer?: PromiseReducer<State, Action>,
) => [
  React.FC<StateProviderProps>,
  () => StateContext<PromiseState<State>, Action>,
  React.FC<StateProviderProps>,
];

const createState: CreateState = <State, Action>(
  initialState: State,
  getInitialState: () => Promise<State>,
  reducer: PromiseReducer<State, Action>,
  mockReducer: PromiseReducer<State, Action>,
) => {

  /**
   * Initialize with empty state.
   * */
  const StateContext = createContext<StateContext<PromiseState<State>, Action>>([
    {
      ...initialState, ...defaultLoadState
    },
    (): void => {} // eslint-disable-line @typescript-eslint/no-empty-function
  ]);

  /**
   * React context provider component.
   * */
  const StateProvider: React.FunctionComponent<StateProviderProps> = ({
    children,
  }: StateProviderProps) => (
    <StateContext.Provider
      value={usePromiseReducer(initialState, getInitialState, reducer)}
    >
      {children}
    </StateContext.Provider>
  );

  /**
   * React mock context provider component for testing components without
   * relying on external APIs.
   * */
  const MockStateProvider: React.FunctionComponent<StateProviderProps> = ({
    children,
  }: StateProviderProps) => (
    <StateContext.Provider
      value={usePromiseReducer(initialState, getInitialState, mockReducer)}
    >
      {children}
    </StateContext.Provider>
  );

  /**
   * Custom context hook to use state.
   * */
  const useStateValue = (): StateContext<PromiseState<State>, Action> => useContext(StateContext);

  return [StateProvider, useStateValue, MockStateProvider];
};

export default createState;
