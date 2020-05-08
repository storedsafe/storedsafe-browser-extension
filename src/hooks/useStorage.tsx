import createState from './createPromiseReducerState';
import {
  State,
  Action,
  reducer,
  emptyState,
} from '../reducers/StorageReducer';

const [
  StorageProvider, useStorage
] = createState<State, Action>(
  reducer,
  emptyState,
);

export { StorageProvider, useStorage };
