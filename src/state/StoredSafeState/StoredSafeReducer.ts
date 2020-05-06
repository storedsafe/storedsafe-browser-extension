import StoredSafe, { StoredSafeVault, StoredSafeObject, StoredSafeTemplate } from 'storedsafe';
import { Session } from '../../model/Sessions';

export interface State {
  [url: string]: {
    vaults: { [id: string]: StoredSafeVault };
    objects: { [id: string]: StoredSafeObject };
    templates: { [id: string]: StoredSafeTemplate };
  };
}

export const emptyState = {};

export interface Action {
  type: 'find';
  url: string;
  session: Session;
  needle?: string;
}

const error = (message: string): void => {
  throw new Error(`StoredSafeReducer: ${message}`);
};

const missingParameterError = (parameterName: string): void => {
  error(`Missing parameter in dispatch action '${parameterName}'.`);
};

export const reducer = (state: State, action: Action): Promise<State> => {
  if (action.type === undefined) {
    missingParameterError('type');
  }
  const { url, session } = action;
  if (url === undefined) {
    missingParameterError('url');
  } else if (session === undefined) {
    missingParameterError('session');
  }
  const { apikey, token } = session;
  if (apikey === undefined) {
    missingParameterError('session.apikey');
  } else if (token === undefined) {
    missingParameterError('session.token');
  }

  const storedSafe = new StoredSafe(url, apikey, token);
  switch(action.type) {
    case 'find': {
      const { needle } = action;
      if (needle === undefined) {
        missingParameterError('needle');
      }
      return storedSafe.find(needle).then((res) => {
        if (res.status === 200) {
          return {
            [url]: {
              vaults: state[url] && state[url].vaults || {},
              objects: res.data.OBJECT,
              templates: res.data.TEMPLATESINFO,
            }
          }
        }
        throw new Error(res.data.ERRORS.join(' | '));
      });
    }
    default: {
      error(`Invalid action type '${action.type}'.`);
    }
  }
};
