import { sites as sitesStorage } from "@/global/storage";
import { loading } from "../loading.svelte";

export const SITES_LOADING_ID = "sites.loading";
export const SITES_ADD_LOADING_ID = "sites.add";
export const SITES_REMOVE_LOADING_ID = "sites.remove";
export const SITES_CLEAR_LOADING_ID = "sites.clear";

class SitesStore {
  data: Site[] = $state([]);

  constructor() {
    const promise = sitesStorage.subscribe(this.#update);
    loading.add(SITES_LOADING_ID, promise, {
      onSuccess: (data) => (this.data = data),
    });
  }

  add = sitesStorage.add;
  remove = sitesStorage.remove;
  clear = sitesStorage.clear;

  #update(newValue: Site[], _oldValue: Site[]) {
    this.data = newValue;
  }
}

export const sites = new SitesStore();
