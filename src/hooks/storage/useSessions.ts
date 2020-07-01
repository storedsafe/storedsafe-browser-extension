/**
 * This module creates a hook which can be used in a React Component to
 * interact with the browser storage API. This module encapsulates the external
 * browser storage API so that implementing components can be run without
 * concerning themselves with external dependencies.
 */
import { useState, useEffect } from 'react'
import { actions as SessionsActions } from '../../model/storage/Sessions'

/**
 * Base state of the hook.
 * @param isInitialized - True if the initial fetch has been completed.
 * @param sessions - Sessions from storage.
 */
interface SessionsState {
  isInitialized: boolean
  sessions: Sessions
}

/**
 * State computed based on the base state.
 * @param isOnline - True if there are any active sessions
 * @param numberOfSessions - Total number of active sessions
 */
interface ComputedSessionsState {
  isOnline: boolean
  numberOfSessions: number
}

/**
 * Functions to mutate the state of the hook. All functions return an empty
 * promise which should be used to handle loading/error states of the
 * implementing component.
 * @param fetch - Fetch state from storage.
 * @param add - Add new session to storage.
 * @param remove - Remove session from storage.
 */
interface SessionsFunctions {
  add: (host: string, session: Session) => Promise<void>
  remove: (host: string) => Promise<void>
  clear: () => Promise<void>
  fetch: () => Promise<void>
}

/**
 * Compiled state of the hook.
 */
type State = SessionsState & ComputedSessionsState & SessionsFunctions

/**
 * Hook to access sessions from storage.
 */
export const useSessions = (): State => {
  // Keep base state in single object to avoid unnecessary
  // renders when updating multiple fields at once.
  const [state, setState] = useState<SessionsState>({
    isInitialized: false,
    sessions: new Map()
  })

  /**
   * Manually fetch session from storage. This should only be done in situations
   * where you know the hook state is out of sync with the storage area, for
   * example during initialization.
   */
  async function fetch (): Promise<void> {
    const sessions = await SessionsActions.fetch()
    setState(prevState => ({
      ...prevState,
      isInitialized: true,
      sessions
    }))
  }

  /**
   * Add session to storage.
   * @param host - Host related to the session
   * @param session - Session to be added.
   */
  async function add (host: string, session: Session): Promise<void> {
    await SessionsActions.add(host, session)
  }

  /**
   * Remove session from storage.
   * @param host - Host related to the session
   */
  async function remove (host: string): Promise<void> {
    await SessionsActions.remove(host)
  }

  /**
   * Clear all sessions from storage.
   */
  async function clear (): Promise<void> {
    await SessionsActions.clear()
  }

  // Run when mounted
  useEffect(() => {
    /**
     * Listen for changes in storage rather than updating state manually so
     * that external updates can be caught without having double updates when
     * changes come from this hook.
     * @param changes - Changes in storage area.
     * @param area - The storage area where the changes occured.
     */
    const storageListener = (
      changes: { [key: string]: browser.storage.StorageChange },
      area: string
    ): void => {
      const change = changes.sessions
      if (change?.newValue !== undefined && area === 'local') {
        setState(prevState => ({
          ...prevState,
          sessions: change.newValue
        }))
      }
    }

    // Initialize state
    fetch().catch(error => console.error(error))

    // Set up listener when the component is mounted.
    browser.storage.onChanged.addListener(storageListener)

    // Remove listener when the component is unmounted.
    return (): void => {
      browser.storage.onChanged.removeListener(storageListener)
    }
  }, [])

  const numberOfSessions = [...state.sessions.keys()].length

  return {
    ...state,
    numberOfSessions,
    isOnline: numberOfSessions !== 0,
    fetch,
    add,
    remove,
    clear
  }
}
