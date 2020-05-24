import StoredSafe, {
  StoredSafePromise,
  StoredSafeResponse,
  StoredSafeObject,
  StoredSafeTemplate,
} from 'storedsafe';
import {
  actions as sessions,
  Sessions
} from './Sessions';
import {
  actions as search,
  SearchResultFields,
  SearchResult,
  SiteSearchResults,
  SearchResults,
} from './Search';
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
    console.log('StoredSafe Response error', response);
    throw new Error(`StoredSafe Error: (${response.status}) ${response.statusText}`);
  }).catch((error) => {
    console.log('StoredSafe Error', error);
    if (error.response) {
      throw new Error(`StoredSafe Error: ${error.response.data.ERRORS}`);
    } else if (error.request) {
      throw new Error(`Network Error: (${error.request.status}) ${error.request.statusText}`);
    }
    throw new Error(`Unexpected Error: ${error}`);
  })
);

/**
 * Create search result from StoredSafe response data.
 * */
const parseSearchResult = (
  ssObject: StoredSafeObject,
  ssTemplate: StoredSafeTemplate,
  isDecrypted = false,
): SearchResult => {
  const isFile = ssObject.templateid === '3';
  const name = isFile ? ssObject.filename : ssObject.objectname;
  const { name: type, ico: icon } = ssTemplate.INFO;
  const fields: SearchResultFields = {};
  Object.keys(ssTemplate.STRUCTURE).forEach((field) => {
    const {
      translation: title,
      encrypted: isEncrypted,
      policy: isPassword,
    } = ssTemplate.STRUCTURE[field];
    const value = (
      isEncrypted
        ? (isDecrypted ? ssObject.crypted[field] : undefined)
        : ssObject.public[field]
    );
    fields[field] = {
      title,
      value,
      isEncrypted,
      isDecrypted,
      isPassword,
    };
  });
  return {
    name,
    type,
    icon,
    fields,
  };
};

/**
 * Get StoredSafe handler for the given url.
 * */
function getHandler(
  url: string
): Promise<StoredSafe> {
  return sessions.fetch().then((currentSessions) => {
    if (currentSessions[url] === undefined) {
      throw new Error(`No active session for ${url}`);
    }
    const { apikey, token } = currentSessions[url];
    return new StoredSafe(url, apikey, token);
  });
}

export const actions = {
  /**
   * Attempt login with given site.
   * */
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

  /**
   * Logout from given site.
   * Will silently remove session even if logout fails.
   * */
  logout: (
    url: string,
  ): Promise<Sessions> => {
    return getHandler(url).then((storedSafe) => (
      handleErrors(storedSafe.logout()).catch((error) => {
        console.error('StoredSafe Logout Error', error);
      }).then(() => (
        sessions.remove(url)
      ))
    ));
  },

  /**
   * Find search results from given sites.
   * */
  find: (
    urls: string[],
    needle: string,
  ): Promise<SiteSearchResults>[] => {
    return urls.map((url) => {
      return getHandler(url).then((storedSafe) => {
        return handleErrors(storedSafe.find(needle)).then((data) => {
          const siteSearchResults: SiteSearchResults = {};
          const objectIds = Object.keys(data.OBJECT);
          for(let i = 0; i < objectIds.length; i++) {
            const objectId = objectIds[i];
            const ssObject = data.OBJECT[objectId];
            const ssTemplate = data.TEMPLATESINFO[ssObject.templateid];
            siteSearchResults[objectId] = parseSearchResult(
              ssObject,
              ssTemplate,
            );
          }
          return siteSearchResults;
        });
      });
    });
  },

  decrypt: (
    url: string,
    objectId: string,
  ): Promise<SearchResults> => {
    return sessions.fetch().then((sessions) => {
      const { apikey, token } = sessions[url];
      const storedSafe = new StoredSafe(url, apikey, token);
      return handleErrors(storedSafe.objectDecrypt(objectId)).then((data) => {
        const ssObject = data.OBJECT[objectId];
        const ssTemplate = data.TEMPLATESINFO[ssObject.templateid];
        return {
          [url]: {
            [objectId]: parseSearchResult(ssObject, ssTemplate),
          },
        };
      });
    });
  }
};
