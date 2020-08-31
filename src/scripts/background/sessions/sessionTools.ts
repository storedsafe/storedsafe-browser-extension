import { actions as SettingsActions } from '../../../model/storage/Settings'
import { actions as StoredSafeActions } from '../../../model/storedsafe/StoredSafe'
import { actions as SessionsActions } from '../../../model/storage/Sessions'
import StoredSafeError from '../../../utils/StoredSafeError'
import { TabHandler } from '../search'

class StoredSafeSessionToolsError extends StoredSafeError {}

/**
 * Returns true if there are any active sessions, otherwise false.
 */
export async function checkOnlineStatus (): Promise<boolean> {
  return SessionsActions.fetch().then(sessions => sessions.size > 0)
}

/**
 * Invalidate a single session and destroy all cached search results for
 * that host.
 * @param host - Host of session to invalidate.
 * */
export async function invalidateSession (host: string): Promise<void> {
  const logoutPromise = StoredSafeActions.logout(host)
  const purgePromise = TabHandler.PurgeHost(host)
  await logoutPromise
  await purgePromise
}

/**
 * Invalidate all sessions and clear search results.
 * */
export async function invalidateAllSessions (): Promise<void> {
  const logoutPromise = StoredSafeActions.logoutAll()
  const clearPromise = TabHandler.Clear()
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

/**
 * Unregister listener from updates to the list of active sessions.
 * @param listener Previously registered listener (see `subscribeToSessions`).
 */
export async function unsubscribeFromSessions (
  listener: (session: Sessions) => void
) {
  SessionsActions.onChanged.removeListener(listener)
}

// Keep references to listeners for unsubscribing
type SettingsListener = (settings: Settings) => void
const settingsListeners: Map<Function, SettingsListener> = new Map()

/**
 * Subscribe to changes of specific fields in the user settings.
 * @param key The key in the settings object to observe changes on.
 * @param listener Callback function for when the value has changed.
 * @param onError Callback function for when an error occurs.
 * @param initialize Whether or not to fetch an initial state (default: `true`).
 */
export async function subscribeToSettingsField<T extends SettingsFieldValue> (
  key: string,
  listener: (value: T) => void,
  onError: (error: Error) => void,
  initialize = true
) {
  // Reference to previous value in case settings update is due to another field changing
  let prevValue: T = null

  // Subscribe to changes in settings
  SettingsActions.onChanged.addListener(onSettingsChanged)

  // Save reference to listener for unsubscribing
  settingsListeners.set(listener, onSettingsChanged)

  if (initialize) {
    // Perform initial setup
    SettingsActions.fetch()
      .then(onSettingsChanged)
      .catch(onError)
  }

  /**
   * Middleware function to parse settings updates before sending back the
   * actual value to the listener if it was changed.
   * @param settings Updated settings object.
   */
  function onSettingsChanged (settings: Settings) {
    try {
      // Get requested value from settings object
      const value: T = settings.get(key).value as T

      // Other value in settings was most likely changed
      if (prevValue === value) return

      // Throw an error if the requested value doesn't exist (shouldn't happen)
      if (value === undefined) {
        throw new StoredSafeSessionToolsError(
          `'${key}' property of Settings is undefined.`
        )
      }

      // Update previous value reference
      prevValue = value

      // Send new value to the listener
      listener(value)
    } catch (error) {
      onError(error)
    }
  }
}

/**
 * Unregister listener from updates to settings field.
 * @param listener Previously registered listener (see `subscribeToSettingsField`).
 */
export function unsubscribeFromSettingsField (
  listener: (value: SettingsFieldValue) => void
) {
  const onSettingsChanged: SettingsListener = settingsListeners.get(listener)
  if (onSettingsChanged === undefined) {
    throw new StoredSafeSessionToolsError(
      'listener is not registered, cannot unregister.'
    )
  }
  SettingsActions.onChanged.removeListener(onSettingsChanged)
}
