/**
 * Abstraction layer for browser storage API to handle persisting options set
 * by the user or by the system administrator. User settings are persisted in
 * sync storage which syncs with your browser account if you're logged in.
 * Administrators can add custom default or enforced values using a managed
 * storage manifest which is loaded by this module.
 * - get/set functions handle all storage interaction.
 * - actions object provides the public interface for the model.
 *
 * Sync storage and managed storage as well as application defaults are merged
 * in this module per field using the following priority:
 * 1. Managed enforced
 * 2. Sync
 * 3. Managed defaults
 * 4. Application defaults
 *
 * When updating settings, all managed fields are silently ignored. The module
 * will however not prevent the setting of fields in sync storage that also exist
 * in managed enforced storage because when fetching settings, any such overlapping
 * fields will simply be ignored in favor of higher priority settings.
 * */

const systemStorage = browser.storage.managed;
const userStorage = browser.storage.sync;

/**
 * Helper type to facility transition between pure values and SettingsField.
 * */
export type SettingsValues = {
  [key: string]: SettingsFieldValue;
};

/**
 * Default values for settings.
 * */
export const defaults: SettingsValues = {
  idleMax: 15,
  autoFill: false,
  maxTokenLife: 180,
};

/**
 * Properties for fields to be passed to the React component that renders the
 * form to update settings.
 * */
export interface FieldsProps {
  [name: string]: {
    label: string;
    unit?: string;
    attributes: {
      type: string;
      [attr: string]: string | number | boolean;
    };
  };
}

/**
 * Fields to be passed to the React component that renders the form to update
 * settings.
 * */
export const fields: FieldsProps = {
  autoFill: {
    label: 'Auto Fill',
    attributes: {
      type: 'checkbox',
    },
  },
  idleMax: {
    label: 'Logout after being idle for',
    unit: 'minutes',
    attributes: {
      type: 'number',
      required: true,
      min: 1,
      max: 120,
    },
  },
  maxTokenLife: {
    label: 'Always log out after being online for',
    unit: 'hours',
    attributes: {
      type: 'number',
      required: true,
      min: 1,
    },
  },
}

/**
 * Populates given Settings object in-place.
 * @param settings - Existing settings to merge with.
 * @param values - Values to populate settings with.
 * @param managed - Whether or not the values are managed.
 * */
const populate = (
  settings: Settings,
  values: SettingsValues,
  managed = false
): void => {
  Object.keys(values).forEach((key) => {
    if (!settings.has(key)) {
      settings.set(key, { managed, value: values[key] });
    }
  });
};

/**
 * Get settings from managed and sync storage and convert
 * into Settings object where enforced values from managed
 * storage are set as managed.
 * @returns Merged user and system settings.
 * */
const get = (): Promise<Settings> => {
  const settings: Settings = new Map();
  return systemStorage.get('settings').catch(
    () => ({ settings: new Map([]) })
  ).then(({ settings: system }) => {
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
 * Commit user settings to sync storage.
 * @param settings - New user settings.
 * */
const set = (settings: Settings): Promise<void> => {
  const userSettings: SettingsValues = {};
  for (const [key, field] of settings) {
    if (field.managed === false) {
      userSettings[key] = field.value;
    }
  }
  return userStorage.set({ settings: userSettings });
}

export const actions = {
  /**
   * Update user settings. Managed fields will be ignored.
   * @param settings - Updated settings.
   * @returns New merged user and system settings.
   * */
  update: (updatedSettings: Settings): Promise<Settings> => {
    return get().then((settings) => {
      const newSettings = new Map([...settings, ...updatedSettings]);
      return set(newSettings).then(get);
    })
  },

  /**
   * Fetch settings from storage.
   * @returns Merged user and system settings.
   * */
  fetch: get,
};