import createPromiseState from '../createPromiseState';
import * as StoredSafeReducer from './StoredSafeReducer';


const getInitialState = (): Promise<StoredSafeReducer.State> => (
  Promise.resolve(StoredSafeReducer.emptyState)
);

const [
  StoredSafeProvider, useStoredSafe
] = createPromiseState<StoredSafeReducer.State, StoredSafeReducer.Action>(
  StoredSafeReducer.emptyState,
  getInitialState,
  StoredSafeReducer.reducer
);

export { StoredSafeProvider, useStoredSafe };
