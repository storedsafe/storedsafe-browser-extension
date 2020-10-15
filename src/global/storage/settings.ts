import {
  StoredSafeSettingsGetError,
  StoredSafeSettingsSetValuesError,
  StoredSafeSettingsClearError,
  StoredSafeSettingsClearValueError,
  StoredSafeSettingsSetValueNotFoundError,
  StoredSafeSettingsSetManagedValueError
} from '../errors'
import { getMessage, LocalizedMessage } from '../i18n'
import type { OnAreaChanged } from './StorageArea'

export enum SettingsFields {
  IDLE_MAX = 'idleMax',
  AUTO_FILL = 'autoFill',
  MAX_TOKEN_LIFE = 'maxTokenLife'
}

export interface SettingsField {
  label: string
  title?: string
  unit?: string
  attributes: {
    type: string
    [attr: string]: string | number | boolean
  }
}

export const FIELDS = new Map<SettingsFields, SettingsField>([
  [
    SettingsFields.AUTO_FILL,
    {
      label: getMessage(LocalizedMessage.SETTINGS_AUTO_FILL_LABEL),
      title: getMessage(LocalizedMessage.SETTINGS_AUTO_FILL_TITLE),
      attributes: {
        type: 'checkbox'
      }
    }
  ],
  [
    SettingsFields.IDLE_MAX,
    {
      label: getMessage(LocalizedMessage.SETTINGS_IDLE_MAX_LABEL),
      unit: getMessage(LocalizedMessage.SETTINGS_UNIT_MINUTES),
      attributes: {
        type: 'number',
        min: 1,
        max: 120
      }
    }
  ],
  [
    SettingsFields.MAX_TOKEN_LIFE,
    {
      label: getMessage(LocalizedMessage.SETTINGS_MAX_TOKEN_LIFE_LABEL),
      unit: getMessage(LocalizedMessage.SETTINGS_UNIT_HOURS),
      attributes: {
        type: 'number',
        min: 1,
        max: 30
      }
    }
  ]
])

const STORAGE_KEY = 'settings'
const EMPTY_STATE: Record<string, any> = {}

let listeners: OnAreaChanged<Map<string, Setting>>[] = []

function parse (
  values: Record<string, any>,
  managed: boolean = false
): Map<string, Setting> {
  values = values ?? EMPTY_STATE
  const settings: Map<string, Setting> = new Map()
  for (const key of Object.keys(values)) {
    settings.set(key, { value: values[key], managed })
  }
  return settings
}

function merge (
  enforced: Map<string, Setting>,
  managedDefaults: Map<string, Setting>,
  sync: Map<string, Setting>
): Map<string, Setting> {
  return new Map([
    ...DEFAULT_SETTINGS,
    ...managedDefaults,
    ...sync,
    ...enforced
  ])
}

const DEFAULT_SETTINGS = parse({
  idleMax: 20,
  autoFill: false,
  maxTokenLife: 8
})

/**
 * @returns [enforced, default]
 */
async function getManagedSettings (): Promise<
  [Map<string, Setting>, Map<string, Setting>]
> {
  try {
    const { settings } = await browser.storage.managed.get(STORAGE_KEY)
    console.log('MANAGED %o', settings)
    return [parse(settings?.enforced, true), parse(settings?.default)]
  } catch (error) {
    // Log debug message if managed storage fails because of missing manifest.
    if (error.toString().includes('storage manifest')) {
      console.debug('No managed storage manifest found.')
      return [new Map(), new Map()]
    } else throw error
  }
}

async function getSyncSettings () {
  const { settings } = await browser.storage.sync.get(STORAGE_KEY)
  return parse(settings)
}

/**
 * Get and parse sessions from storage.
 * @returns Current sessions.
 * @throws {StoredSafeSettingsGetError}
 */
export async function get (): Promise<Map<string, Setting>> {
  try {
    // Convert to Map from serializable format. Map objects are not serializable
    // and will result as an empty object if put in storage.
    // Parse settings from different areas and merge with priority order fromt the
    // top lowest to highest.
    let sync = await getSyncSettings()
    let [enforced, managedDefaults] = await getManagedSettings()
    return merge(enforced, managedDefaults, sync)
  } catch (error) {
    throw new StoredSafeSettingsGetError(error)
  }
}

async function set (settings: Map<string, Setting>): Promise<void> {
  // Convert to serializable format, using null coalescing before converting
  // to array to ensure values are not undefined (causes TypeError).
  // Filter out managed fields.
  await browser.storage.sync.set({
    [STORAGE_KEY]: [...(settings ?? [])].filter(
      ([_key, { managed }]) => !managed
    )
  })
}

/**
 * Subscribe to changes in storage area and return the current state.
 * @param cb Callback function to be called when storage area is updated.
 * @returns Current settings.
 * @throws {StoredSafeSettingsGetError} if get of current state fails.
 */
export async function subscribe (
  cb: OnAreaChanged<Map<string, Setting>>
): Promise<Map<string, Setting>> {
  listeners.push(cb)
  return await get()
}

/**
 * Subscribe to changes in storage area.
 * @param cb Callback function to be called when storage area is updated.
 */
export function unsubscribe (cb: OnAreaChanged<Map<string, Setting>>): void {
  listeners = listeners.filter(listener => listener !== cb)
}

/**
 * Set one or more values in user settings.
 * @param values Key-value settings pairs.
 * @throws {StoredSafeSettingsGetError}
 * @throws {StoredSafeSettingsSetValueNotFoundError}
 * @throws {StoredSafeSettingsSetManagedValueError}
 */
export async function setValues (
  values: Record<string, string | number | boolean>
) {
  try {
    const settings = await get()
    for (const key of Object.keys(values)) {
      if (!settings.has(key))
        throw new StoredSafeSettingsSetValueNotFoundError(key)
      else if (settings.get(key).managed)
        throw new StoredSafeSettingsSetManagedValueError(key)
      settings.get(key).value = values[key]
    }
    await set(settings)
  } catch (error) {
    if (
      error instanceof StoredSafeSettingsGetError ||
      error instanceof StoredSafeSettingsSetValueNotFoundError ||
      error instanceof StoredSafeSettingsSetManagedValueError
    )
      throw error
    throw new StoredSafeSettingsSetValuesError(error)
  }
}

/**
 * Clear a value from user settings, restoring it to its default value.
 * @param key Settings field key.
 * @throws {StoredSafeSettingsGetError}
 * @throws {StoredSafeSettingsClearValueError}
 */
export async function clearValue (key: string) {
  try {
    const settings = await get()
    settings.delete(key)
    await set(settings)
  } catch (error) {
    if (error instanceof StoredSafeSettingsGetError) throw error
    throw new StoredSafeSettingsClearValueError(key, error)
  }
}

/**
 * Clear all user settings.
 * @throws {StoredSafeSettingsClearError}
 */
export async function clear () {
  try {
    await browser.storage.local.remove(STORAGE_KEY)
  } catch (error) {
    throw new StoredSafeSettingsClearError(error)
  }
}

function notify (
  newValues: Map<string, Setting>,
  oldValues: Map<string, Setting>
): void {
  for (const listener of listeners) {
    listener(newValues, oldValues)
  }
}

/**
 * When ignore list updates in storage, notify listeners.
 */
browser.storage.onChanged.addListener((changes, area) => {
  if (!!changes[STORAGE_KEY]) {
    const { oldValue, newValue } = changes[STORAGE_KEY]
    if (area === 'sync') {
      // Changes include sync, but not managed; fetch managed
      getManagedSettings().then(([enforced, managedDefaults]) => {
        notify(
          merge(enforced, managedDefaults, parse(newValue)),
          merge(enforced, managedDefaults, parse(oldValue))
        )
      })
    } else if (area === 'managed') {
      // Changes include managed, but not sync; fetch sync
      getSyncSettings().then(sync => {
        notify(
          merge(parse(newValue.enforced), parse(newValue.default), sync),
          merge(parse(oldValue.enforced), parse(oldValue.default), sync)
        )
      })
    }
  }
})
