/**
 * Abstraction layer for the StoredSafe API wrapper to handle writing
 * relevant data to storage and parsing the raw StoredSafe response into
 * the more relevant application data structures.
 * - actions object provides the public interface for the model.
 * */

import StoredSafe, {
  StoredSafePromise,
  StoredSafeData,
  StoredSafeErrorData
} from 'storedsafe'
import { actions as SessionsActions } from '../storage/Sessions'
import { actions as TabResultsActions } from '../storage/TabResults'
import { actions as objectHandler } from './ObjectHandler'
import { actions as authHandler } from './AuthHandler'
import { actions as miscHandler } from './MiscHandler'

/**
 * Wraps StoredSafe handler in a callback function so the response can be
 * chacked for errors before being sent back to the function performing the
 * request.
 * */
type StoredSafeRequestCallback = (
  handler: StoredSafe
) => StoredSafePromise<StoredSafeData>

/**
 * Lets functions in separate modules receive a StoredSafe handler to perform
 * a request on which is then sent back for error checking before being parsed
 * in the function that sent the request.
 * */
export type MakeStoredSafeRequest = (
  cb: StoredSafeRequestCallback
) => Promise<StoredSafeData>

/**
 * Helper function to handle errors when interacting with the StoredSafe API.
 * All StoredSafe requests with errors will look similar and therefore be
 * handled the same way.
 * @param promise - Promise returned by StoredSafe request.
 * @returns Data returned by StoredSafe or promise with error.
 * */
async function handleErrors (
  promise: StoredSafePromise<StoredSafeData>
): Promise<StoredSafeData> {
  try {
    const response = await promise
    return response.data
  } catch (error) {
    if (error.response?.data !== undefined) {
      const data = error.response?.data as StoredSafeErrorData
      if (data.ERRORS?.length > 0) {
        const errors = data.ERRORS.join(' | ')
        throw new Error(`StoredSafe Error: ${errors}`)
      }
      if (data.ERRORCODES !== undefined && Object.keys(data.ERRORCODES).length > 0) {
        const errors = Object.values(data.ERRORCODES).join(' | ')
        throw new Error(`StoredSafe Error: ${errors}`)
      }
      // Server sent error code but no error response (see 404 for empty vaults)
      throw error
    } else if (error.request !== undefined) {
      const { status, statusText } = error.request as {
        status: string
        statusText: string
      }
      throw new Error(`Network Error: (${status}) ${statusText}`)
    }
    const message = error.message as string
    throw new Error(`Unexpected Error: ${message}`)
  }
}

/**
 * Get StoredSafe handler for the given host.
 * @param host - Host to connect to.
 * @returns StoredSafe handler or promise with error if no session was found.
 * */
async function getHandler (host: string): Promise<StoredSafe> {
  const sessions = await SessionsActions.fetch()
  if (sessions.get(host) === undefined) {
    throw new Error(`No active session for ${host}`)
  }
  const { token } = sessions.get(host)
  return new StoredSafe({ host, token })
}

/**
 * Create and perform initial handling of request.
 * @param host - Host to create handler callback for.
 * @returns Request function to be passed to sub-handlers.
 * */
function makeRequest (host: string): MakeStoredSafeRequest {
  return async cb =>
    await handleErrors(
      getHandler(host).then(async handler => await cb(handler))
    )
}

/// /////////////////////////////////////////////////////////
// auth

/**
 * Attempt login with given site.
 * @param site - Site to attempt login with.
 * @param fields - Credentials and specification of login type.
 * @returns Updated list of active sessions (if login is successful).
 * */
async function login (
  { host, apikey }: Site,
  fields: LoginFields
): Promise<Sessions> {
  const handler = new StoredSafe({ host, apikey })
  const request: MakeStoredSafeRequest = async cb =>
    await handleErrors(cb(handler))
  const session = await authHandler.login(request, fields)
  return await SessionsActions.add(host, session)
}

/**
 * Logout from given site.
 * Will silently remove session even if logout fails.
 * @param host - Host related to the session to invalidate.
 * @returns Updated list of active sessions.
 * */
async function logout (host: string): Promise<Sessions> {
  try {
    await authHandler.logout(makeRequest(host))
  } catch (error) {
    console.error('StoredSafe Logout Error', error)
  }
  return await SessionsActions.remove(host)
}

/**
 * Logout from all sites.
 * Will silently remove sessions even if logout fails.
 * @returns Updated list of active sessions (empty).
 * */
async function logoutAll (): Promise<Sessions> {
  const sessions = await SessionsActions.fetch()
  ;[...sessions.keys()].forEach(host => {
    authHandler.logout(makeRequest(host)).catch(error => {
      console.error('StoredSafe Logout Error', error)
    })
  })
  return await SessionsActions.clear()
}

/**
 * Check if session is still valid, remove it if it's not.
 * @param host - Host related to the session to validate.
 * @returns Updated list of active sessions.
 * */
async function check (host: string): Promise<Sessions> {
  const isValid = await authHandler.check(makeRequest(host))
  return isValid
    ? await SessionsActions.fetch()
    : await SessionsActions.remove(host)
}

/**
 * Check if sessions are still valid, remove those that are not.
 * @returns Updated list of active sessions.
 * */
async function checkAll (): Promise<Sessions> {
  const sessions = await SessionsActions.fetch()
  const invalidHosts: string[] = []
  for (const host of sessions.keys()) {
    const isValid = await authHandler.check(makeRequest(host))
    if (!isValid) {
      invalidHosts.push(host)
    }
  }
  if (invalidHosts.length > 0) {
    return await SessionsActions.remove(...invalidHosts)
  }
  return sessions
}

/// /////////////////////////////////////////////////////////
// object

/**
 * Find search results from given sites.
 * @param host - Host to perform search on.
 * @param needle - Search string to match against in StoredSafe.
 * @returns Matched results from host.
 * */
async function find (host: string, needle: string): Promise<SSObject[]> {
  return await objectHandler.find(makeRequest(host), needle)
}

/**
 * Decrypt StoredSafe object.
 * @param host - Host to request decryption from.
 * @param objectId - ID in StoredSafe of object to decrypt.
 * @returns The decrypted object.
 * */
async function decrypt (host: string, objectId: string): Promise<SSObject> {
  return await objectHandler.decrypt(makeRequest(host), objectId)
}

/**
 * Add object to StoredSafe.
 * @param host - Host to add object to.
 * @param params - Object parameters based on the chosen StoredSafe template.
 * */
async function addObject (host: string, params: object): Promise<void> {
  return await objectHandler.add(makeRequest(host), params)
}

/**
 * Find search results related to tab and put in storage
 * from all logged in sites.
 * @param tabId - The ID of the tab associated with the search.
 * @param needle - The search string to match against in StoredSafe.
 * @returns Updated list of all cached tab search results.
 * */
async function tabFind (tabId: number, needle: string): Promise<TabResults> {
  const sessions = await SessionsActions.fetch()
  const hosts = [...sessions.keys()]
  const promises: Array<Promise<SSObject[]>> = hosts.map(async host => {
    try {
      return await find(host, needle)
    } catch (error) {
      // Log error rather than failing all results in Promise.all
      console.error(error)
      // Ensure a valid response is returned
      return []
    }
  })
  const siteResults = await Promise.all(promises)
  const results: Results = new Map()
  for (let i = 0; i < siteResults.length; i++) {
    results.set(hosts[i], siteResults[i])
  }
  return await TabResultsActions.setTabResults(tabId, results)
}

/// /////////////////////////////////////////////////////////
// misc

/**
 * Get info about site structure and capabilities.
 * @param host - Host to retreive info about.
 * @returns - Info regarding the structure of the site.
 * */
async function getSiteInfo (host: string): Promise<SSSiteInfo> {
  const handler = await getHandler(host)
  const request: MakeStoredSafeRequest = async cb =>
    await handleErrors(cb(handler))
  const vaults = await miscHandler.getVaults(request)
  const templates = await miscHandler.getTemplates(request)
  return { vaults, templates }
}

/**
 * Generate a new password.
 * @param host - Host to request a password from.
 * @param params - Optional parameters for password generation.
 * @returns Generated password.
 * */
async function generatePassword (
  host: string,
  params?: {
    type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin'
    length?: number
    language?: 'en_US' | 'sv_SE'
    delimeter?: string
    words?: number
    min_char?: number
    max_char?: number
    policyid?: string
  }
): Promise<string> {
  return await miscHandler.generatePassword(makeRequest(host), params)
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
  generatePassword
}
