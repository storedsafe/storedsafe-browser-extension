/**
 * Interfaces and types related to the browser storage areas.
 * - Fields which are only accessed by namesd keys should be defined as
 *   plain interfaces.
 * - Fields which are only accessed by iteration should be defined as
 *   Array types.
 * - Fields which are accessed both by named keys and by iteration should be
 *   defined as Map types. These must have a serializable version since Map
 *   types cannot be serialized, meaning they would vanish when entered into
 *   the storage area unless made serializable first. This can be done by
 *   converting any Map objects into arrays using `Array.from(mapObject)`.
 * */

/// /////////////////////////////////////////////////////////
// Ignore

/**
 * Ignored sites.
 * */
type Ignore = string[]

/// /////////////////////////////////////////////////////////
// Settings

/**
 * Possible value types of settings field.
 * */
type SettingsFieldValue = string | number | boolean

/**
 * Settings field value and whether it is managed by the organization or not.
 * */
interface SettingsField {
  managed: boolean
  value: SettingsFieldValue
}

/**
 * Direct mapping of field name to value. Is converted to Object by Settings
 * module before entering storage, no serializable version required.
 * */
type Settings = Map<string /* field name */, SettingsField>

/// /////////////////////////////////////////////////////////
// Sites

/**
 * Data required to authenticate with a site.
 * */
interface Site {
  host: string
  apikey: string
}

interface SiteCollections {
  system: Site[]
  user: Site[]
}

interface Sites {
  list: Site[]
  collections: SiteCollections
}

/// /////////////////////////////////////////////////////////
// Sessions

/**
 * Data related to a session.
 * */
interface Session {
  token: string
  createdAt: number
  warnings: { [key: string]: string }
  violations: { [key: string]: string }
  timeout: number
}

/**
 * Sessions mapped to a host.
 * */
type Sessions = Map<string /* host */, Session>
type SerializableSessions = Array<[string /* host */, Session]>

/// /////////////////////////////////////////////////////////
// Site Preferences

/**
 * Preferences per site.
 * */
interface SitePreferences {
  username?: string
  loginType?: LoginType
}

/**
 * Preferences based on user interaction.
 * */
interface Preferences {
  lastUsedSite?: string
  sites: {
    [host: string]: SitePreferences
  }
}

/// /////////////////////////////////////////////////////////
// All values in storage.

interface Storage {
  ignore: Ignore // Local
  preferences: Preferences // Local
  sessions: Sessions // Local
  settings: Settings // Sync and Managed
  sites: Sites // Sync and Managed
}
