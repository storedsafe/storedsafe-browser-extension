/**
 * Handle StoredSafe requests related to the /auth endpoint.
 *
 * All exposed functions should take a function of the type MakeStoredSafeRequest
 * as their first parameter which will expose the handler for the relevant site
 * and handle common errors before returning a promise with just the unparsed data
 * if everything went well.
 *
 * This module should only concern itself with sending requests and parsing incoming
 * data. Error handling and storage modifications should be handled in `StoredSafe.ts`.
 *
 * @packageDocumentation
 * */
import { StoredSafePromise } from 'storedsafe';
import { MakeStoredSafeRequest } from './StoredSafe';

/**
 * Login to StoredSafe.
 * @param request - Request callback function.
 * @param fields - Credentials and specification of login type.
 * @returns Session created from response if successful.
 * */
function login(
  request: MakeStoredSafeRequest,
  fields: LoginFields
): Promise<Session> {
  return request((handler) => {
    let promise: StoredSafePromise;
    if (fields.loginType === 'yubikey') {
      const { username, keys } = fields as YubiKeyFields;
      const passphrase = keys.slice(0, -44);
      const otp = keys.slice(-44);
      promise = handler.loginYubikey(username, passphrase, otp);
    } else if (fields.loginType === 'totp') {
      const {
        username,
        passphrase,
        otp,
      } = fields as TOTPFields;
      promise = handler.loginTotp(username, passphrase, otp);
    }
    return promise;
  }).then((data) => {
    const { token, audit } = data.CALLINFO;
    const violations = (Array.isArray(audit.violations) ? {} : audit.violations);
    const warnings = (Array.isArray(audit.warnings) ? {} : audit.warnings);

    return {
      token,
      createdAt: Date.now(),
      violations,
      warnings,
    };
  });
}

/**
 * Logout from StoredSafe
 * @param request - Request callback function.
 * @param host - Host related to the session to invalidate.
 * */
function logout(request: MakeStoredSafeRequest): Promise<void> {
  return request((handler) => handler.logout()).then();
}

/**
 * Check if token is still valid and refresh the token if it is.
 * @param request - Request callback function.
 * @returns True if token is still valid, otherwise false.
 * */
function check(request: MakeStoredSafeRequest): Promise<boolean> {
  return request((handler) => handler.check()).then(() => {
    return true;
  }).catch(() => {
    return false;
  });
}

export const actions = {
  login,
  logout,
  check,
};
