import { settings as settingsStorage } from "../../../global/storage";
import { loading } from "../loading.svelte";

export const SETTINGS_LOADING_ID = "settings.loading";
export const SETTINGS_UPDATE_LOADING_ID = "settings.update";
export const SETTINGS_CLEAR_LOADING_ID = "settings.clear";

class SettingsState {
  data: SettingsMap = $state(new Map());

  constructor() {
    const promise = settingsStorage.subscribe(this.#update);
    loading.add(SETTINGS_LOADING_ID, promise, {
      onSuccess: (data) => (this.data = data),
    });
  }

  set = settingsStorage.setValues;
  clear = settingsStorage.clear;

  #update(newValue: SettingsMap, _oldValue: SettingsMap) {
    this.data = newValue;
  }
}

export const settings = new SettingsState();
