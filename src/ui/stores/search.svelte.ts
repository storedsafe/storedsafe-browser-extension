import { vault } from "@/global/api";
import { Context, sendMessage } from "@/global/messages";
import { sessions } from "@/global/storage";
import { loading } from "./loading.svelte";
import { Duration, messages, MessageType } from "./messages.svelte";
import { SvelteMap } from "svelte/reactivity";
import { Logger } from "@/global/logger";

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
  sessions: Map<string, Session> = $state(new SvelteMap());

  constructor() {
    this.onSessionsChanged = this.onSessionsChanged.bind(this);
    this.search = this.search.bind(this);
    this.edit = this.edit.bind(this);
    this.delete = this.delete.bind(this);
    this.decrypt = this.decrypt.bind(this);

    const tabResultsPromise = sendMessage({
      from: Context.POPUP,
      to: Context.BACKGROUND,
      action: "tabresults.get",
    });
    const sessionsPromise = sessions.subscribe(
      (data) => (this.sessions = new SvelteMap(data))
    );
    loading.add(
      SEARCH_INIT_LOADING_ID,
      Promise.all([tabResultsPromise, sessionsPromise]),
      {
        onSuccess: ([tabResults, sessionsData]) => {
          this.isInitialized = true;
          this.tabResults = tabResults;
          this.results = tabResults;
          logger.info(`Found ${tabResults.length} results for current tab.`);
          this.sessions = new SvelteMap(sessionsData);
        },
      }
    );
  }

  onSessionsChanged(
    newValue: Map<string, Session>,
    _oldValues: Map<string, Session>
  ) {
    this.sessions = new SvelteMap(newValue);
    this.results = this.results.filter((result) =>
      this.sessions.has(result.host)
    );
    this.tabResults = this.tabResults.filter((tabResult) =>
      this.sessions.has(tabResult.host)
    );
  }

  async search(needle: string) {
    if (needle === "") {
      this.results = this.tabResults;
    } else {
      this.results = [];
      for (const [host, { token }] of this.sessions) {
        const siteResults = await vault.search(host, token, needle);
        this.results.push(...siteResults);
      }
    }
  }

  async edit(
    result: StoredSafeObject,
    values: Record<string, string>
  ): Promise<StoredSafeObject> {
    const session = this.sessions.get(result.host);
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
    const session = this.sessions.get(result.host);
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
    const session = this.sessions.get(result.host);
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
