import { derived, Readable } from 'svelte/store'
import * as auth from '../../../global/api/auth'
import { browserStorage } from './browserStorage'

export const SESSIONS_LOGIN_LOADING_ID = 'sessions.login.totp'
export const SESSIONS_LOGOUT_LOADING_ID = 'sessions.logout'
export const SESSIONS_CLEAR_LOADING_ID = 'sessions.clear'

interface SessionsStore extends Readable<Map<string, Session>> {
  /**
   * Perform a StoredSafe login using TOTP for 2FA.
   * @param host StoredSafe host to authenticate against.
   * @param username StoredSafe username associated with host.
   * @param passphrase StoredSafe password associated with username and host.
   * @param otp Time-based One-time Password.
   */
  loginTotp: (
    site: Site,
    username: string,
    passphrase: string,
    otp: string
  ) => Promise<void>

  /**
   * Perform a StoredSafe login using YubiKey for 2FA.
   * @param host StoredSafe host to authenticate against.
   * @param username StoredSafe username associated with host.
   * @param passphrase StoredSafe password associated with username and host.
   * @param otp Yubikey press, HMAC-based One-time Password.
   */
  loginYubikey: (
    site: Site,
    username: string,
    passphrase: string,
    otp: string
  ) => Promise<void>

  /**
   * Invalidate the StoredSafe token associated with the `host` session.
   * @param host StoredSafe host to logout from.
   * @param token Token associated with `host` session.
   */
  logout: (host: string, token: string) => Promise<void>

  /**
   * Check the validity of the StoredSafe `token` associated the `host` session,
   * and invalidate the session if the `token` is invalid.
   * @param host StoredSafe host associated with session.
   * @param token Token associated with `host` session.
   */
  check: (host: string, token: string) => Promise<void>
}

function sessionsStore (): SessionsStore {
  const { subscribe } = derived(
    browserStorage,
    $browserStorage => $browserStorage.sessions
  )

  return {
    subscribe,
    loginTotp: auth.loginTotp,
    loginYubikey: auth.loginYubikey,
    logout: auth.logout,
    check: auth.check
  }
}

export const sessions = sessionsStore()
