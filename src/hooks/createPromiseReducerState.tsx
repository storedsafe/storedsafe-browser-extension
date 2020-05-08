import React, { createContext, useContext } from 'react';
import PromiseReducer, {
  usePromiseReducer, PromiseReducerHook
} from '../reducers/PromiseReducer';

interface StateProviderProps {
  children: React.ReactNode;
}

type CreateState = <State, Action>(
  reducer: PromiseReducer<State, Action>,
  emptyState: State,
) => [React.FC<StateProviderProps>, () => PromiseReducerHook<State, Action>];

const createState: CreateState = <State, Action>(
  reducer: PromiseReducer<State, Action>,
  emptyState: State,
) => {
  const StateContext = createContext<PromiseReducerHook<State, Action>>({
    state: emptyState,
    dispatch: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    isInitialized: false,
  });

  const StateProvider: React.FC<StateProviderProps> = ({
    children,
  }: StateProviderProps) => (
    <StateContext.Provider value={usePromiseReducer(reducer, emptyState)}>
      {children}
    </StateContext.Provider>
  );

  const useStateValue = (): PromiseReducerHook<State, Action> => (
    useContext(StateContext)
  );

  return [StateProvider, useStateValue];
};

export default createState;
