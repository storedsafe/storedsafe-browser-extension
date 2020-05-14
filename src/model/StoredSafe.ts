import StoredSafe, {
  StoredSafePromise,
  StoredSafeResponse,
} from 'storedsafe';
import { actions as sessions, Session, Sessions } from './Sessions';
import { actions as search, SearchResult, SearchResults } from './Search';
import { Site } from './Sites';

export type LoginType = 'yubikey' | 'totp';

export interface TOTPFields {
  username: string;
  passphrase: string;
  otp: string;
}

export interface YubiKeyFields {
  username: string;
  keys: string;
}

export type LoginFields = { loginType: LoginType } & TOTPFields & YubiKeyFields;

const handleErrors = (promise: StoredSafePromise): Promise<StoredSafeResponse> => (
  promise.then((response) => {
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(`StoredSafe Error: (${response.status}) ${response.statusText}`);
  }).catch((error) => {
    if (error.response) {
      throw new Error(`StoredSafe Error: ${error.response.data.ERRORS}`);
    } else if (error.request) {
      throw new Error(`Network Error: (${error.request.status}) ${error.request.statusText}`);
    }
    throw new Error(`Unexpected Error: ${error}`);
  })
);

export const actions = {
  login: (
    { url, apikey }: Site,
    fields: LoginFields
  ): Promise<Sessions> => {
    const storedSafe = new StoredSafe(url, apikey);
    let promise: StoredSafePromise;
    if (fields.loginType === 'yubikey') {
      const { username, keys } = fields as YubiKeyFields;
      const passphrase = keys.slice(0, -44);
      const otp = keys.slice(-44);
      promise = storedSafe.authYubikey(username, passphrase, otp);
    } else if (fields.loginType === 'totp') {
      const {
        username,
        passphrase,
        otp,
      } = fields as TOTPFields;
      promise = storedSafe.authTotp(username, passphrase, otp);
    }
    return handleErrors(promise).then((data) => {
      const { token } = data.CALLINFO;
      return sessions.add(url, {
        apikey,
        token,
        createdAt: Date.now(),
        errors: [],
        warnings: [],
      });
    });
  },

  logout: (url: string, { apikey, token }: Session): Promise<Sessions> => {
    const storedSafe = new StoredSafe(url, apikey, token);
    return handleErrors(storedSafe.logout()).then(() => (
      sessions.remove(url)
    ));
  },

  searchFind: (
    needle: string,
    url: string,
    { apikey, token }: Session
  ): Promise<SearchResults> => {
    const storedSafe = new StoredSafe(url, apikey, token);
    search.setLoading(url);
    return handleErrors(storedSafe.find(needle)).then((data) => {
      const searchResults: SearchResult[] = [];
      const objectIds = Object.keys(data.OBJECT);
      for(let i = 0; i < objectIds.length; i++) {
        const ssObject = data.OBJECT[objectIds[i]];
        const ssTemplate = data.TEMPLATESINFO[ssObject.templateid];
        searchResults.push({ ssObject, ssTemplate });
      }
      return search.setResults(url, searchResults)
    });
  },

  searchDecrypt: (
    url: string,
    id: number,
    { apikey, token }: Session
  ): Promise<SearchResults> => {
    search.setLoading(url);
    const storedSafe = new StoredSafe(url, apikey, token);
    return search.fetch().then((searchResults) => {
      const siteResults = [...searchResults[url].results];
      const objectId = siteResults[id].ssObject.id;
      return handleErrors(storedSafe.object(objectId)).then((data) => {
        const ssObject = data.OBJECT[objectId];
        const ssTemplate = data.TEMPLATESINFO[ssObject.templateid];
        siteResults[id] = { ssObject, ssTemplate };
        return search.setResults(url, siteResults);
      });
    });
  },

  find: (
    needle: string,
  ): Promise<{ [url: string]: Promise<SearchResult[]> }> => {
    return sessions.fetch().then((sessions) => {
      const promises: { [url: string]: Promise<SearchResult[]> } = {};
      Object.keys(sessions).forEach((url) => {
        const { apikey, token } = sessions[url];
        const storedSafe = new StoredSafe(url, apikey, token);
        promises[url] = handleErrors(storedSafe.find(needle)).then((data) => {
          const searchResults: SearchResult[] = [];
          const objectIds = Object.keys(data.OBJECT);
          for(let i = 0; i < objectIds.length; i++) {
            const ssObject = data.OBJECT[objectIds[i]];
            const ssTemplate = data.TEMPLATESINFO[ssObject.templateid];
            searchResults.push({ ssObject, ssTemplate });
          }
          return searchResults;
        });
      });
      return promises;
    });
  },

  decrypt: (
    url: string,
    objectId: string,
    { apikey, token }: Session
  ): Promise<SearchResult> => {
    search.setLoading(url);
    const storedSafe = new StoredSafe(url, apikey, token);
    return handleErrors(storedSafe.objectDecrypt(objectId)).then((data) => {
      const ssObject = data.OBJECT[objectId];
      const ssTemplate = data.TEMPLATESINFO[ssObject.templateid];
      return { ssObject, ssTemplate };
    });
  }
};
