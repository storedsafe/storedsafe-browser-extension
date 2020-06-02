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
  Search,
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

export interface Template {
  title: string;
  icon: string;
  id: string;
  fields: {
    name: string;
    type: string;
  }[];
}

export interface Vault {
  title: string;
  id: string;
}

const handleErrors = (promise: StoredSafePromise): Promise<StoredSafeResponse> => (
  promise.then((response) => {
    if (response.status === 200) {
      return response.data;
    }
    throw new Error(`StoredSafe Error: (${response.status}) ${response.statusText}`);
  }).catch((error) => {
    if (error.response) {
      throw new Error(`StoredSafe Error: ${error.response.data.ERRORS.join(' | ')}`);
    } else if (error.request) {
      throw new Error(`Network Error: (${error.request.status}) ${error.request.statusText}`);
    }
    throw new Error(`Unexpected Error: ${error.message}`);
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
  const isFile = ssTemplate.info.file !== undefined;
  const name = isFile ? ssObject.filename : ssObject.objectname;
  const { name: type, ico: icon } = ssTemplate.info;
  const fields: SearchResultFields = {};
  ssTemplate.structure.forEach((field) => {
    const {
      translation: title,
      encrypted: isEncrypted,
      policy: isPassword,
    } = field;
    const value = (
      isEncrypted
        ? (isDecrypted ? ssObject.crypted[field.fieldname] : undefined)
        : ssObject.public[field.fieldname]
    );
    fields[field.fieldname] = {
      title,
      value,
      isEncrypted,
      isPassword,
    };
  });
  return {
    name,
    type,
    icon,
    isDecrypted,
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

/**
 * Attempt login with given site.
 * */
function login(
  { url, apikey }: Site,
  fields: LoginFields
): Promise<Sessions> {
  const storedSafe = new StoredSafe(url, apikey);
  let promise: StoredSafePromise;
  if (fields.loginType === 'yubikey') {
    const { username, keys } = fields as YubiKeyFields;
    const passphrase = keys.slice(0, -44);
    const otp = keys.slice(-44);
    promise = storedSafe.loginYubikey(username, passphrase, otp);
  } else if (fields.loginType === 'totp') {
    const {
      username,
      passphrase,
      otp,
    } = fields as TOTPFields;
    promise = storedSafe.loginTotp(username, passphrase, otp);
  }
  return handleErrors(promise).then((data) => {
    const { token, audit } = data.CALLINFO;
    const violations = (
      Array.isArray(audit.violations)
        ? {}
        : audit.violations
    );
    const warnings = (
      Array.isArray(audit.warnings)
        ? {}
        : audit.warnings
    );
    return sessions.add(url, {
      apikey,
      token,
      createdAt: Date.now(),
      violations,
      warnings,
    });
  });
}

/**
 * Logout from given site.
 * Will silently remove session even if logout fails.
 * */
function logout(
  url: string,
): Promise<Sessions> {
  return getHandler(url).then((storedSafe) => (
    handleErrors(storedSafe.logout()).catch((error) => {
      console.error('StoredSafe Logout Error', error);
    }).then(() => (
      sessions.remove(url)
    ))
  ));
}

/**
 * Find search results from given sites.
 * */
function find(
  url: string,
  needle: string,
): Promise<SiteSearchResults> {
  return getHandler(url).then((storedSafe) => {
    return handleErrors(storedSafe.find(needle)).then((data) => {
      const siteSearchResults: SiteSearchResults = {};
      for(let i = 0; i < data.OBJECT.length; i++) {
        const ssObject = data.OBJECT[i];
        const objectId = ssObject.id;
        const ssTemplate = data.TEMPLATES.find((template) => template.id === ssObject.templateid);
        const isFile = ssTemplate.info.file !== undefined;
        if (isFile) { // Skip files
          continue;
        }
        siteSearchResults[objectId] = parseSearchResult(
          ssObject,
          ssTemplate,
        );
      }
      return siteSearchResults;
    });
  });
}

/**
 * Decrypt StoredSafe object.
 * */
function decrypt(
  url: string,
  objectId: string,
): Promise<SearchResult> {
  return getHandler(url).then((storedSafe) => {
    return handleErrors(storedSafe.decryptObject(objectId)).then((data) => {
      const ssObject = data.OBJECT.find((obj) => obj.id === objectId);
      const ssTemplate = data.TEMPLATES.find((template) => template.id === ssObject.templateid);
      return parseSearchResult(ssObject, ssTemplate, true);
    });
  });
}

/**
 * Find search results related to tab and put in storage
 * from all logged in sites.
 * */
function tabFind(
  tabId: number,
  needle: string
): Promise<Search> {
  return sessions.fetch().then((sessions) => {
    const urls = Object.keys(sessions);
    const promises: Promise<SiteSearchResults>[] = urls.map((url) => {
      return find(url, needle).catch((error) => {
        console.error(error);
      }).then();
    });
    return Promise.all(promises).then((siteResults) => {
      const results: SearchResults = {};
      for (let i = 0; i < siteResults.length; i++) {
        results[urls[i]] = siteResults[i];
      }
      return search.setTabResults(tabId, results)
    });
  });
}

export const actions = {
  login,
  logout,
  find,
  decrypt,
  tabFind,
};
