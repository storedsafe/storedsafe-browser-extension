import { sites as sitesStorage } from "@/global/storage";
import { loading } from "../loading.svelte";

export const SITES_LOADING_ID = "sites.loading";
export const SITES_ADD_LOADING_ID = "sites.add";
export const SITES_REMOVE_LOADING_ID = "sites.remove";
export const SITES_CLEAR_LOADING_ID = "sites.clear";

class SitesState {
  isInitialized: boolean = $state(false);
  data: Site[] = $state([]);

  constructor() {
    const promise = sitesStorage.subscribe(this.#update.bind(this));
    loading.add(SITES_LOADING_ID, promise, {
      onSuccess: (data) => {
        this.#update(data, this.data);
        this.isInitialized = true;
      },
    });
  }

  add = sitesStorage.add;
  remove = sitesStorage.remove;
  clear = sitesStorage.clear;

  #update(newValue: Site[], _oldValue: Site[]) {
    this.data = newValue;
  }
}

export const sites = new SitesState();
