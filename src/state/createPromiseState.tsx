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
) => [React.FC<StateProviderProps>, () => StateContext<PromiseState<State>, Action>];

const createState: CreateState = <State, Action>(
  initialState: State,
  getInitialState: () => Promise<State>,
  reducer: PromiseReducer<State, Action>,
) => {
  const StateContext = createContext<StateContext<PromiseState<State>, Action>>([
    {
      ...initialState, ...defaultLoadState
    },
    (action: Action) => {} // eslint-disable-line
  ]);

  const StateProvider: React.FC<StateProviderProps> = ({
    children,
  }: StateProviderProps) => (
    <StateContext.Provider
      value={usePromiseReducer(initialState, getInitialState, reducer)}
    >
      {children}
    </StateContext.Provider>
  );

  const useStateValue = (): StateContext<PromiseState<State>, Action> => useContext(StateContext);

  return [StateProvider, useStateValue];
};

export default createState;
