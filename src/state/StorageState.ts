import createPromiseState from './createPromiseState';
import * as StorageReducer from './StorageReducer';


const getInitialState = (): Promise<StorageReducer.State> => (
  StorageReducer.reducer(StorageReducer.emptyState, { type: 'init' })
);

const [
  StorageProvider, useStorage
] = createPromiseState<StorageReducer.State, StorageReducer.Action>(
  StorageReducer.emptyState,
  getInitialState,
  StorageReducer.reducer
);

export { StorageProvider, useStorage };
