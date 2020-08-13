import { actions as StoredSafeActions } from '../../../model/storedsafe/StoredSafe'
import { actions as TabResultsActions } from '../../../model/storage/TabResults'

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
