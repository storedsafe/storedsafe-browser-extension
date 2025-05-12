import { vault } from "@/global/api";
import { Context, sendMessage } from "@/global/messages";
import { sessions, tabresults } from "@/global/storage";
import { loading } from "./loading.svelte";
import { Duration, messages, MessageType } from "./messages.svelte";
import { Logger } from "@/global/logger";
import { instances } from "./instances.svelte";

export const SEARCH_INIT_LOADING_ID = "search.initializing";
export const SEARCH_LOADING_ID = "search.find";
export const SEARCH_EDIT_LOADING_ID = "search.edit";
export const SEARCH_DELETE_LOADING_ID = "search.delete";
export const SEARCH_REMOVE_LOADING_ID = "search.remove";
export const SEARCH_DECRYPT_LOADING_ID = "search.remove";

const logger = new Logger("instances");

class Search {
  isInitialized: boolean = $state(false);
  tabResults: StoredSafeObject[] = $state([]);
  results: StoredSafeObject[] = $state([]);

  constructor() {
    this.onTabResultsChanged = this.onTabResultsChanged.bind(this);
    this.search = this.search.bind(this);
    this.edit = this.edit.bind(this);
    this.delete = this.delete.bind(this);
    this.decrypt = this.decrypt.bind(this);

    const tabResultsPromise = tabresults.subscribe(this.onTabResultsChanged);
    loading.add(SEARCH_INIT_LOADING_ID, tabResultsPromise, {
      onSuccess: (tabResults) => {
        this.onTabResultsChanged(tabResults);
        this.isInitialized = true;
        logger.info(`Found ${this.tabResults.length} results for current tab.`);
      },
    });
  }

  async onTabResultsChanged(
    _newValue: Map<number, StoredSafeObject[]>,
    _oldValues?: Map<number, StoredSafeObject[]>
  ) {
    this.tabResults = await sendMessage({
      from: Context.POPUP,
      to: Context.BACKGROUND,
      action: "tabresults.get",
    });
    this.results = this.tabResults;
  }

  async search(needle: string) {
    if (needle === "") {
      this.results = this.tabResults;
    } else {
      const currentSessions = await sessions.get();
      this.results = [];
      const promises = [];
      for (const [host, { token }] of currentSessions) {
        promises.push(vault.search(host, token, needle));
        console.log("Searching %s...", host);
      }
      for (const promise of promises) {
        const siteResults = await promise;
        this.results.push(...siteResults);
      }
    }
  }

  async edit(
    result: StoredSafeObject,
    values: Record<string, string>
  ): Promise<StoredSafeObject> {
    const currentSessions = await sessions.get();
    const session = currentSessions.get(result.host);
    if (!session) {
      // shouldn't happen
      messages.add(
        "Failed to edit, no active session",
        MessageType.ERROR,
        Duration.SHORT
      );
      return result;
    }
    const editResult = await vault.editObject(
      result.host,
      session.token,
      result,
      values
    );
    const index = this.results.findIndex(({ id }) => id === result.id);
    this.results[index] = editResult;
    return editResult;
  }

  async delete(result: StoredSafeObject): Promise<StoredSafeObject> {
    const currentSessions = await sessions.get();
    const session = currentSessions.get(result.host);
    if (!session) {
      // shouldn't happen
      messages.add(
        "Failed to delete, no active session",
        MessageType.ERROR,
        Duration.SHORT
      );
      return result;
    }

    const deleteResult = await vault.deleteObject(
      result.host,
      session.token,
      result
    );
    this.results = this.results.filter(({ id }) => id !== result.id);
    return deleteResult;
  }

  async decrypt(result: StoredSafeObject) {
    const currentSessions = await sessions.get();
    const session = currentSessions.get(result.host);
    if (!session) {
      // shouldn't happen
      messages.add(
        "Failed to decrypt, no active session",
        MessageType.ERROR,
        Duration.SHORT
      );
      return result;
    }
    const decryptedResult = await vault.decryptObject(
      result.host,
      session.token,
      result
    );
    const index = this.results.findIndex(({ id }) => id === result.id);
    this.results[index] = decryptedResult;
    return decryptedResult;
  }
}

export const search = new Search();
