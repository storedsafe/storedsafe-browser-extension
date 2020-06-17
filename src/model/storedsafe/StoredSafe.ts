/**
 * Abstraction layer for the StoredSafe API wrapper to handle writing
 * relevant data to storage and parsing the raw StoredSafe response into
 * the more relevant application data structures.
 * - actions object provides the public interface for the model.
 * */

import StoredSafe, {
  StoredSafePromise,
  StoredSafeResponse,
} from 'storedsafe';
import { actions as SessionsActions } from '../storage/Sessions';
import { actions as TabResultsActions } from '../storage/TabResults';
import { actions as objectHandler } from './ObjectHandler';
import { actions as authHandler } from './AuthHandler';
import { actions as miscHandler } from './MiscHandler';

/**
 * Wraps StoredSafe handler in a callback function so the response can be
 * chacked for errors before being sent back to the function performing the
 * request.
 * */
type StoredSafeRequestCallback = (handler: StoredSafe) => StoredSafePromise;

/**
 * Lets functions in separate modules receive a StoredSafe handler to perform
 * a request on which is then sent back for error checking before being parsed
 * in the function that sent the request.
 * */
export type MakeStoredSafeRequest = (
  cb: StoredSafeRequestCallback
) => Promise<StoredSafeResponse>;

/**
 * Helper function to handle errors when interacting with the StoredSafe API.
 * All StoredSafe requests with errors will look similar and therefore be
 * handled the same way.
 * @param promise - Promise returned by StoredSafe request.
 * @returns Data returned by StoredSafe or promise with error.
 * */
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
 * Get StoredSafe handler for the given host.
 * @param host - Host to connect to.
 * @returns StoredSafe handler or promise with error if no session was found.
 * */
function getHandler(host: string): Promise<StoredSafe> {
  return SessionsActions.fetch().then((sessions) => {
    if (sessions.get(host) === undefined) {
      throw new Error(`No active session for ${host}`);
    }
    const { token } = sessions.get(host);
    return new StoredSafe({ host, token });
  });
}

/**
 * Create and perform initial handling of request.
 * @param host - Host to create handler callback for.
 * @returns Request function to be passed to sub-handlers.
 * */
function makeRequest(host: string): MakeStoredSafeRequest {
  const request: MakeStoredSafeRequest = (cb) => (
    handleErrors(getHandler(host).then((handler) => cb(handler)))
  );
  return request;
}

////////////////////////////////////////////////////////////
// auth

/**
 * Attempt login with given site.
 * @param site - Site to attempt login with.
 * @param fields - Credentials and specification of login type.
 * @returns Updated list of active sessions (if login is successful).
 * */
function login(
  { host, apikey }: Site,
  fields: LoginFields
): Promise<Sessions> {
  const handler = new StoredSafe({ host, apikey });
  const request: MakeStoredSafeRequest = (cb) => (
    handleErrors(cb(handler))
  );
  return authHandler.login(request, fields).then((session) => (
    SessionsActions.add(host, session)
  ));
}

/**
 * Logout from given site.
 * Will silently remove session even if logout fails.
 * @param host - Host related to the session to invalidate.
 * @returns Updated list of active sessions.
 * */
function logout(host: string): Promise<Sessions> {
  return authHandler.logout(makeRequest(host)).catch((error) => {
    console.error('StoredSafe Logout Error', error);
  }).then(() => (
    SessionsActions.remove(host)
  ))
}

/**
 * Logout from all sites.
 * Will silently remove sessions even if logout fails.
 * @returns Updated list of active sessions (empty).
 * */
function logoutAll(): Promise<Sessions> {
  return SessionsActions.fetch().then((sessions) => {
    Array.from(sessions.keys()).forEach((host) => {
      authHandler.logout(makeRequest(host)).catch((error) => {
        console.error('StoredSafe Logout Error', error);
      });
    });
    return Promise.resolve<Sessions>(SessionsActions.clear());
  });
}

/**
 * Check if session is still valid, remove it if it's not.
 * @param host - Host related to the session to validate.
 * @returns Updated list of active sessions.
 * */
function check(host: string): Promise<Sessions> {
  return authHandler.check(makeRequest(host)).then((isValid) => {
    return isValid ? SessionsActions.fetch() : SessionsActions.remove(host)
  })
}

/**
 * Check if sessions are still valid, remove those that are not.
 * @returns Updated list of active sessions.
 * */
function checkAll(): Promise<Sessions> {
  return SessionsActions.fetch().then(async (sessions) => {
    const invalidHosts: string[] = [];
    for (const host of sessions.keys()) {
      const isValid = await authHandler.check(makeRequest(host));
      if (!isValid) {
        invalidHosts.push(host);
      }
    }
    return SessionsActions.remove(...invalidHosts);
  });
}

////////////////////////////////////////////////////////////
// object

/**
 * Find search results from given sites.
 * @param host - Host to perform search on.
 * @param needle - Search string to match against in StoredSafe.
 * @returns Matched results from host.
 * */
function find(host: string, needle: string): Promise<SSObject[]> {
  return check(host).then(() => {
    return objectHandler.find(makeRequest(host), needle).then((results) => {
      return results;
    });
  });
}

/**
 * Decrypt StoredSafe object.
 * @param host - Host to request decryption from.
 * @param objectId - ID in StoredSafe of object to decrypt.
 * @returns The decrypted object.
 * */
function decrypt(host: string, objectId: string): Promise<SSObject> {
  return objectHandler.decrypt(makeRequest(host), objectId);
}

/**
 * Add object to StoredSafe.
 * @param host - Host to add object to.
 * @param params - Object parameters based on the chosen StoredSafe template.
 * */
function addObject(host: string, params: object): Promise<void> {
  return objectHandler.add(makeRequest(host), params);
}

/**
 * Find search results related to tab and put in storage
 * from all logged in sites.
 * @param tabId - The ID of the tab associated with the search.
 * @param needle - The search string to match against in StoredSafe.
 * @returns Updated list of all cached tab search results.
 * */
function tabFind(
  tabId: number,
  needle: string,
): Promise<TabResults> {
  return SessionsActions.fetch().then((sessions) => {
    const hosts = Array.from(sessions.keys());
    const promises: Promise<SSObject[]>[] = hosts.map((host) => {
      return find(host, needle).catch((error) => {
        // Log error rather than failing all results in Promise.all
        console.error(error);
      }).then((data) => data || []); // Ensure array
    });
    return Promise.all(promises).then((siteResults) => {
      const results: Results = new Map();
      for (let i = 0; i < siteResults.length; i++) {
        results.set(hosts[i], siteResults[i]);
      }
      return TabResultsActions.setTabResults(tabId, results)
    });
  });
}

////////////////////////////////////////////////////////////
// misc

/**
 * Get info about site structure and capabilities.
 * @param host - Host to retreive info about.
 * @returns - Info regarding the structure of the site.
 * */
function getSiteInfo(host: string): Promise<SSSiteInfo> {
  return getHandler(host).then(async (handler) => {
    const request: MakeStoredSafeRequest = (cb) => (
      handleErrors(cb(handler))
    );
    const vaults = await miscHandler.getVaults(request);
    const templates = await miscHandler.getTemplates(request);
    return { vaults, templates };
  });
}

/**
 * Generate a new password.
 * @param host - Host to request a password from.
 * @param params - Optional parameters for password generation.
 * @returns Generated password.
 * */
function generatePassword(
  host: string,
  params: {
    type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin';
    length?: number;
    language?: 'en_US' | 'sv_SE';
    delimeter?: string;
    words?: number;
    min_char?: number;
    max_char?: number;
    policyid?: string;
  }
): Promise<string> {
  return miscHandler.generatePassword(makeRequest(host), params);
}

export const actions = {
  login,
  logout,
  logoutAll,
  check,
  checkAll,
  find,
  decrypt,
  tabFind,
  addObject,
  getSiteInfo,
  generatePassword,
};
