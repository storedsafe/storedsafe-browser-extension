const systemStorage = browser.storage.managed;
const userStorage = browser.storage.sync;

export interface Field {
  managed: boolean;
  value: string | number | boolean;
}

export interface Settings {
  [key: string]: Field;
}

export interface SettingsValues {
  [key: string]: string | number | boolean;
}

export const defaults: SettingsValues = {
  autoFill: false,
  idleMax: 15,
  maxTokenLife: 180,
};

export interface FieldsProps {
  [name: string]: {
    label: string;
    attributes: {
      type: string;
      [attr: string]: string | number | boolean;
    };
  };
}

export const fields: FieldsProps = {
  autoFill: {
    label: 'Auto Fill',
    attributes: {
      type: 'checkbox',
    },
  },
  idleMax: {
    label: 'Idle Max',
    attributes: {
      type: 'number',
      required: true,
      min: 1,
      max: 60,
    },
  },
  maxTokenLife: {
    label: 'Max token Life',
    attributes: {
      type: 'number',
      required: true,
      min: 60,
      max: 300,
    },
  },
}

/**
 * Populates given Settings object in-place.
 * @param settings Settings object to populate.
 * @param values Values to populate settings with.
 * @param managed Whether or not the values are managed.
 * */
const populate = (
  settings: Settings,
  values: SettingsValues,
  managed = false
): void => {
  Object.keys(values).forEach((key) => {
    if (settings[key] === undefined) {
      settings[key] = { managed, value: values[key] };
    }
  });
};

/**
 * Get settings from managed and sync storage and convert
 * into Settings object where enforced values from managed
 * storage are set as managed.
 * @return Settings Promise containing Settings object.
 * */
const get = (): Promise<Settings> => {
  const settings: Settings = {};
  return systemStorage.get('settings').then(({ settings: system }) => {
    if (system && system.enforced) {
      populate(settings, system.enforced, true);
    }
    return userStorage.get('settings').then(({ settings: user }) => {
      if (user) {
        populate(settings, user);
      }
      if (system && system.defaults) {
        populate(settings, system.defaults);
      }
      populate(settings, defaults);
      return settings;
    });
  });
}

/**
 * Commit settings object to sync storage.
 * @param settings New settings object.
 * */
const set = (settings: Settings): Promise<void> => {
  const userSettings: SettingsValues = {};
  Object.keys(settings).forEach((field) => {
    if (settings[field].managed === false) {
      userSettings[field] = settings[field].value;
    }
  });
  return userStorage.set({ settings: userSettings });
}

export const actions = {
  /**
   * Update user settings. Managed fields will be ignored.
   * */
  update: (updatedSettings: Settings): Promise<Settings> => {
    return get().then((settings) => {
      const newSettings = {
        ...settings,
        ...updatedSettings,
      };
      return set(newSettings).then(() => get());
    })
  },

  /**
   * Fetch settings from storage.
   * */
  fetch: get,
};
