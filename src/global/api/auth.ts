import StoredSafe, { StoredSafeLoginData, StoredSafeError } from 'storedsafe'
import {
  StoredSafeAuthLoginError,
  StoredSafeAuthLogoutError,
  StoredSafeBaseError,
  StoredSafeNetworkError
} from '../errors'
import * as sessions from '../storage/sessions'

// TODO: Improved error handling

function parseMessages(obj: [] | { [key: string]: string }) {
  if (Array.isArray(obj)) return obj
  return [...Object.values(obj)]
}

function parseLogin(data: StoredSafeLoginData): Session {
  return {
    token: data.CALLINFO.token,
    createdAt: Date.now(),
    warnings: parseMessages(data.CALLINFO.audit.warnings),
    violations: parseMessages(data.CALLINFO.audit.violations),
    timeout: data.CALLINFO.timeout
  }
}

/**
 * Perform side effects associated with the addition of a new session.
 * @param host Name of the newly authenticated host.
 * @param session Newly created session.
 */
async function afterLogin(host: string, session: Session) {
  await sessions.add(host, session)
}

/**
 * Login to the given StoredSafe `site` using the time-based one-time password
 * generated by an authenticator application.
 * @param site Site to authenticate against.
 * @param username Username for `host`.
 * @param passphrase Passphrase associated with `username`.
 * @param otp YubiKey press.
 */
export async function loginTotp(
  { host, apikey }: Site,
  username: string,
  passphrase: string,
  otp: string
): Promise<void> {
  const api = new StoredSafe({ host, apikey })
  try {
    const response = await api.loginTotp(username, passphrase, otp)
    if (response.status === 200) {
      await afterLogin(host, parseLogin(response.data))
    } else if (response.status === 403) {
      throw new StoredSafeAuthLoginError()
    } else {
      throw new Error(`Unknown response status: ${response.status}`)
    }
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  }
}

/**
 * Login to the given StoredSafe `site` using the HMAC-based one-time password
 * generated by a YubiKey.
 * @param site Site to authenticate against.
 * @param username Username for `host`.
 * @param passphrase Passphrase associated with `username`.
 * @param otp YubiKey press.
 */
export async function loginYubikey(
  { host, apikey }: Site,
  username: string,
  passphrase: string,
  otp: string
): Promise<void> {
  const api = new StoredSafe({ host, apikey })
  try {
    const response = await api.loginYubikey(username, passphrase, otp)
    if (response.status === 200) {
      await afterLogin(host, parseLogin(response.data))
    } else if (response.status === 403) {
      throw new StoredSafeAuthLoginError()
    } else {
      throw new Error(`Unknown response status: ${response.status}`)
    }
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  }
}

/**
 * Login to the given StoredSafe `site` using smartcard certificate.
 * @param site Site to authenticate against.
 * @param username Username for `host`.
 * @param passphrase Passphrase associated with `username`.
 */
export async function loginSmartcard(
  { host, apikey }: Site,
  username: string,
  passphrase: string,
  otp: string
): Promise<void> {
  const api = new StoredSafe({ host, apikey })
  try {
    const response = await api.loginSmartCard(username, passphrase)
    if (response.status === 200) {
      await afterLogin(host, parseLogin(response.data))
    } else if (response.status === 403) {
      throw new StoredSafeAuthLoginError()
    } else {
      throw new Error(`Unknown response status: ${response.status}`)
    }
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  }
}

async function afterLogout(host: string): Promise<void> {
  await sessions.remove(host)
  // TODO: After logout tasks (purge results, etc)
}

/**
 * Check the validity of a token and remove the associated session
 * if the token is invalid.
 * @param host StoredSafe host name.
 * @param token Token associated with session for `host`.
 */
export async function check(host: string, token: string): Promise<void> {
  const api = new StoredSafe({ host, token })
  try {
    const response = await api.check()
    if (response.status === 403) {
      await afterLogout(host)
    } else if (response.status !== 200) {
      throw new Error(`Unknown response status: ${response.status}`)
    }
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  }
}

/**
 * Invalidate token and remove the associated session.
 * Will discard the session even if the logout request fails.
 * @param host StoredSafe host name.
 * @param token Token associated with session for `host`.
 */
export async function logout(host: string, token: string): Promise<void> {
  const api = new StoredSafe({ host, token })
  try {
    const response = await api.logout()
    if (response.status !== 200) {
      throw new StoredSafeAuthLogoutError(response.status)
    }
    // Defer success actions to finally block
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  } finally {
    await afterLogout(host)
  }
}
