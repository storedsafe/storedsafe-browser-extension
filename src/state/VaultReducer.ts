import { PromiseReducer } from './PromiseReducer';
import StoredSafe, { StoredSafeVault } from 'storedsafe';
import { Session } from '../model/Sessions';

export interface State {
  vaults: {
    [url: string]: {
      [id: string]: StoredSafeVault;
    };
  };
}

export interface Action {
  type: 'fetch';
  url: string;
  session: Session;
}

export const reducer: PromiseReducer<State, Action> = (
  state,
  action
) => {
  switch (action.type) {
    case 'fetch': {
      const { url, session } = action;
      const { apikey, token } = session;
      const storedSafe = new StoredSafe(url, apikey, token);
      return storedSafe.vaultList().then((res) => {
        return { vaults: { [url]: res.data.GROUP } };
      });
    }
    default: {
      throw new Error(`Invalid type: ${action.type}`);
    }
  }
};

export const emptyState: State = {
  vaults: {},
};

export const init = (): Promise<State> => (Promise.resolve(emptyState));

