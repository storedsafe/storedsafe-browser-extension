import { StoredSafeExtensionError } from "../errors";
import type { OnAreaChanged } from "./StorageArea";

const STORAGE_KEY = "tabresults";
const EMPTY_STATE: [number, StoredSafeObject[]][] = [];

let listeners: OnAreaChanged<Map<number, StoredSafeObject[]>>[] = [];

function parse(
  tabresults?: [number, StoredSafeObject[]][]
): Map<number, StoredSafeObject[]> {
  return new Map(structuredClone(tabresults ?? EMPTY_STATE));
}

/**
 * Get and parse tab results from session storage.
 * @returns Current tab results.
 * @throws {StoredSafeExtensionError}
 */
export async function get(): Promise<Map<number, StoredSafeObject[]>> {
  try {
    const { tabresults } = await browser.storage.session.get(STORAGE_KEY);
    // Convert to Map from serializable format. Map objects are not serializable
    // and will result as an empty object if put in storage.
    return parse(tabresults);
  } catch (error) {
    throw new StoredSafeExtensionError(
      "Failed to parse tab results.",
      error as Error
    );
  }
}

async function set(tabresults: Map<number, StoredSafeObject[]>) {
  // Convert to serializable format, using null coalescing before converting
  // to array to ensure values are not undefined (causes TypeError).
  await browser.storage.session.set({
    [STORAGE_KEY]: [...(tabresults ?? [])],
  });
}

/**
 * Subscribe to changes in storage area and return the current state.
 * @param cb Callback function to be called when storage area is updated.
 * @returns Current sessions.
 * @throws {StoredSafeExtensionError} if get of current state fails.
 */
export async function subscribe(
  cb: OnAreaChanged<Map<number, StoredSafeObject[]>>
): Promise<Map<number, StoredSafeObject[]>> {
  listeners.push(cb);
  return await get();
}

/**
 * Subscribe to changes in storage area.
 * @param cb Callback function to be called when storage area is updated.
 */
export function unsubscribe(
  cb: OnAreaChanged<Map<number, StoredSafeObject[]>>
): void {
  listeners = listeners.filter((listener) => listener !== cb);
}

/**
 * Add a new session to storage.
 * @param tabId The numeric ID of the active tab.
 * @param results New list of StoredSafe objects related to the tab.
 * @throws {StoredSafeExtensionError}
 */
export async function add(
  tabId: number,
  results: StoredSafeObject[]
): Promise<void> {
  try {
    // Get current state
    const tabresults = await get();
    // Update results for tab in storage
    tabresults.set(tabId, results);
    await set(tabresults);
  } catch (error) {
    throw new StoredSafeExtensionError(
      "Failed to add results for tab.",
      error as Error
    );
  }
}

/**
 * Remove results for tab.
 * @param tabId Numeric id of the active tab.
 * @throws {StoredSafeExtensionError}
 */
export async function remove(tabId: number): Promise<void> {
  try {
    // Get current state
    const tabresults = await get();
    // Delete results for tab
    tabresults.delete(tabId);
    await set(tabresults);
  } catch (error) {
    throw new StoredSafeExtensionError(
      "Failed to delete results for tab.",
      error as Error
    );
  }
}

/**
 * Remove results for a specific host.
 * Should be called when a session has expired to clean up lingering metadata.
 * @param host Removed host
 */
export async function removeHostResults(host: string): Promise<void> {
  try {
    const tabresults = await get();
    for (let [tabId, results] of tabresults) {
      const newResults = results.filter((result) => result.host !== host);
      tabresults.set(tabId, newResults);
      await set(tabresults);
    }
  } catch (error) {
    throw new StoredSafeExtensionError(
      `Failed to delete tab results for host ${host}`,
      error as Error
    );
  }
}

/**
 * Remove all tab results.
 * @throws {StoredSafeExtensionError}
 */
export async function clear(): Promise<void> {
  try {
    await browser.storage.session.remove(STORAGE_KEY);
  } catch (error) {
    throw new StoredSafeExtensionError(
      "Failed to clear all tab results.",
      error as Error
    );
  }
}

function notify(
  newValues: Map<number, StoredSafeObject[]>,
  oldValues: Map<number, StoredSafeObject[]>
): void {
  for (const listener of listeners) {
    listener(newValues, oldValues);
  }
}

export function onTabResultsChanged(
  cb: (
    newValues: Map<number, StoredSafeObject[]>,
    oldValues: Map<number, StoredSafeObject[]>
  ) => void
) {
  return (changes: { [key: string]: browser.storage.StorageChange }) => {
    if (STORAGE_KEY in changes) {
      const { oldValue, newValue } = changes[STORAGE_KEY];
      cb(parse(newValue), parse(oldValue));
    }
  };
}

/**
 * When sessions update in storage, notify listeners.
 */
browser.storage.onChanged.addListener(onTabResultsChanged(notify));
