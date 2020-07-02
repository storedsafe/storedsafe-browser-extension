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

const systemStorage = browser.storage.managed
const userStorage = browser.storage.sync

/**
 * Helper type to facility transition between pure values and SettingsField.
 * */
export interface SettingsValues {
  [key: string]: SettingsFieldValue
}

/**
 * Default values for settings.
 * @param idleMax - Number of minutes a user can be idle before being logged out.
 * @param autoFill - Whether or not to automatically fill forms when possible.
 * @param maxTokenLife - Number of hours a session is allowed to be maintained.
 * */
export const defaults: SettingsValues = {
  idleMax: 15,
  autoFill: false,
  maxTokenLife: 8
}

/**
 * Properties for fields to be passed to the React component that renders the
 * form to update settings.
 * */
export interface FieldsProps {
  [name: string]: {
    label: string
    unit?: string
    attributes: {
      type: string
      [attr: string]: string | number | boolean
    }
  }
}

/**
 * Fields to be passed to the React component that renders the form to update
 * settings.
 * */
export const fields: FieldsProps = {
  autoFill: {
    label: 'Auto Fill',
    attributes: {
      type: 'checkbox'
    }
  },
  idleMax: {
    label: 'Logout after being idle for',
    unit: 'minutes',
    attributes: {
      type: 'number',
      required: true,
      min: 1,
      max: 120
    }
  },
  maxTokenLife: {
    label: 'Always log out after being online for',
    unit: 'hours',
    attributes: {
      type: 'number',
      required: true,
      min: 1,
      max: 24
    }
  }
}

/**
 * Merge one or more unparsed settings objects into a single Settings object.
 * @param settingsObjects - Settings objects in descending order of priority.
 */
export function merge (
  ...settingsObjects: Array<[Record<string, any>, boolean]>
): Settings {
  const settings: Settings = new Map()
  for (const [settingsObject, managed] of settingsObjects) {
    if (settingsObject !== undefined) {
      populate(settings, settingsObject, managed)
    }
  }
  return settings
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
  Object.keys(values).forEach(key => {
    if (!settings.has(key)) {
      settings.set(key, { managed, value: values[key] })
    }
  })
}

/**
 * Get settings from managed and sync storage and convert
 * into Settings object where enforced values from managed
 * storage are set as managed.
 * @returns Merged user and system settings.
 * */
async function get (): Promise<Settings> {
  const { settings: systemSettings } = await systemStorage.get('settings')
  const { settings: userSettings } = await userStorage.get('settings')
  return merge(
    [systemSettings?.enforced, true],
    [userSettings, false],
    [systemSettings?.defaults, false],
    [defaults, false]
  )
}

/**
 * Commit user settings to sync storage.
 * @param settings - New user settings.
 * */
async function set (settings: Settings): Promise<void> {
  const userSettings: SettingsValues = {}
  for (const [key, field] of settings) {
    if (!field.managed) {
      userSettings[key] = field.value
    }
  }
  return await userStorage.set({ settings: userSettings })
}

/**
 * Update user settings. Managed fields will be ignored.
 * @param settings - Updated settings.
 * @returns New merged user and system settings.
 * */
async function update (updatedSettings: Settings): Promise<Settings> {
  const settings = await get()
  const newSettings = new Map([...settings, ...updatedSettings])
  return await set(newSettings).then(get)
}

async function clear (): Promise<Settings> {
  return await set(new Map()).then(get)
}

export const actions = {
  update,
  clear,
  fetch: get
}
