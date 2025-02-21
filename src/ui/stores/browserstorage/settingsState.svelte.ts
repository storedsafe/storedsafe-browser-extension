import { settings as settingsStorage } from "@/global/storage";
import { loading } from "../loading.svelte";
import { SvelteMap } from "svelte/reactivity";

export const SETTINGS_LOADING_ID = "settings.loading";
export const SETTINGS_UPDATE_LOADING_ID = "settings.update";
export const SETTINGS_CLEAR_LOADING_ID = "settings.clear";

class SettingsState {
  isInitialized: boolean = $state(false);
  data: SettingsMap = $state(new SvelteMap());

  constructor() {
    const promise = settingsStorage.subscribe(this.#update.bind(this));
    loading.add(SETTINGS_LOADING_ID, promise, {
      onSuccess: (data) => {
        this.isInitialized = true;
        this.#update(data, this.data);
      },
    });
  }

  set = settingsStorage.setValues;
  clear = settingsStorage.clear;

  #update(newValue: SettingsMap, _oldValue: SettingsMap) {
    this.data = new SvelteMap(newValue);
  }
}

export const settings = new SettingsState();
