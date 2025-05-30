import { StoredSafeClearAllDataError } from "../errors";

export * as ignore from "./ignore";
export * as preferences from "./preferences";
export * as sessions from "./sessions";
export * as settings from "./settings";
export * as sites from "./sites";
export * as tabresults from "./tabresults";

/**
 * CLEAR ALL USER DATA.
 * @throws {StoredSafeClearAllDataError}
 */
export async function clearAllData(): Promise<void> {
  try {
    const localPromise = browser.storage.local.clear();
    const syncPromise = browser.storage.sync.clear();
    const sessionPromise = browser.storage.session.clear();
    await localPromise;
    await syncPromise;
    await sessionPromise;
  } catch (error) {
    throw new StoredSafeClearAllDataError(error as Error);
  }
}
