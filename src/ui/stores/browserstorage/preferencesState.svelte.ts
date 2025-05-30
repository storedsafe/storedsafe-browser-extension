import { preferences as preferencesStorage } from "@/global/storage";
import { loading } from "../loading.svelte";
import { SvelteMap } from "svelte/reactivity";

export const PREFERENCES_LOADING_ID = "preferences.loading";
export const PREFERENCES_SET_AUTO_FILL_LOADING_ID = "preferences.autofill";
export const PREFERENCES_CLEAR_AUTO_FILL_LOADING_ID =
  "preferences.clear.autofill";
export const PREFERENCES_SET_SITE_LOADING_ID = "preferences.site";
export const PREFERENCES_CLEAR_SITE_LOADING_ID = "preferences.clear.site";
export const PREFERENCES_CLEAR_LOADING_ID = "preferences.clear.all";

class PreferencesState {
  isInitialized: boolean = $state(false);
  data: Preferences = $state({
    add: { host: null, vaults: {} },
    sites: new SvelteMap(),
    autoFill: new SvelteMap(),
  });

  constructor() {
    const promise = preferencesStorage.subscribe(this.#update.bind(this));
    loading.add(PREFERENCES_LOADING_ID, promise, {
      onSuccess: (data) => {
        this.isInitialized = true;
        this.#update(data, this.data);
      },
    });
  }
  setAutoFillPreferences = preferencesStorage.setAutoFillPreferences;
  clearAutoFillPreferences = preferencesStorage.clearAutoFillPreferences;
  setHostPreferences = preferencesStorage.setHostPreferences;
  setVaultPreferences = preferencesStorage.setVaultPreferences;
  clearAddPreferences = preferencesStorage.clearAddPreferences;
  setSitePreferences = preferencesStorage.setSitePreferences;
  clearSitePreferences = preferencesStorage.clearSitePreferences;
  clear = preferencesStorage.clear;

  #update(newValue: Preferences, _oldValue: Preferences) {
    this.data = {
      add: newValue.add,
      sites: new SvelteMap(newValue.sites),
      autoFill: new SvelteMap(newValue.autoFill),
    };
  }
}

export const preferences = new PreferencesState();
