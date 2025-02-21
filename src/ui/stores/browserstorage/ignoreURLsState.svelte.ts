import { ignore as ignoreStorage } from "@/global/storage";
import { loading } from "../loading.svelte";

export const IGNORE_LOADING_ID = "ignore.loading";
export const IGNORE_ADD_LOADING_ID = "ignore.add";
export const IGNORE_REMOVE_LOADING_ID = "ignore.remove";
export const IGNORE_CLEAR_LOADING_ID = "ignore.clear";

class IgnoreURLsState {
  isInitialized: boolean = $state(false);
  data: IgnoreURLs = $state([]);

  constructor() {
    const promise = ignoreStorage.subscribe(this.#update.bind(this));
    loading.add(IGNORE_LOADING_ID, promise, {
      onSuccess: (data) => {
        this.isInitialized = true;
        this.data = data;
      },
    });
  }

  add = ignoreStorage.add;
  remove = ignoreStorage.remove;
  clear = ignoreStorage.clear;

  #update(newValue: IgnoreURLs, _oldVValue: IgnoreURLs) {
    this.data = newValue;
  }
}

export const ignoreURLs = new IgnoreURLsState();
