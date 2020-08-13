import { actions as StoredSafeActions } from '../../../model/storedsafe/StoredSafe'
import { actions as TabResultsActions } from '../../../model/storage/TabResults'
import { actions as SessionsActions } from '../../../model/storage/Sessions'

/**
 * Invalidate a single session and destroy all cached search results for
 * that host.
 * @param host - Host of session to invalidate.
 * */
export async function invalidateSession (host: string): Promise<void> {
  const logoutPromise = StoredSafeActions.logout(host)
  const purgePromise = TabResultsActions.purgeHost(host)
  await logoutPromise
  await purgePromise
}

/**
 * Invalidate all sessions and clear search results.
 * */
export async function invalidateAllSessions (): Promise<void> {
  const logoutPromise = StoredSafeActions.logoutAll()
  const clearPromise = TabResultsActions.clear()
  await logoutPromise
  await clearPromise
}

/**
 * Check whether the token (if any) related to the host is still active.
 * @param host Host to check token status for.
 */
export async function checkSessionToken (host: string): Promise<void> {
  await StoredSafeActions.check(host)
}

/**
 * Subscribe to changes in the list of active sessions and optionally trigger an initial fetch.
 * @param listener Callback function listening for changes in active sessions.
 */
export async function subscribeToSessions (
  listener: (sessions: Sessions) => void,
  initialize = true
): Promise<void> {
  SessionsActions.onChanged.addListener(listener)
  if (initialize) {
    SessionsActions.fetch().then(listener)
  }
}

export async function unsubscribeFromSessions (listener: (session: Sessions) => void) {
  SessionsActions.onChanged.removeListener(listener)
}