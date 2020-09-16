import { actions as IgnoreActions } from '../../../model/storage/Ignore'
import { actions as PreferencesActions } from '../../../model/storage/Preferences'
import { actions as StoredSafeActions } from '../../../model/storedsafe/StoredSafe'
import { checkOnlineStatus } from '../sessions/sessionTools'
import { TabHandler } from '../search'

/**
 * Decrypt result fields and returned fill-friendly version of result.
 * @param result Potentially encrypted StoredSafe result
 */
export async function parseResult (
  result: SSObject
): Promise<[string, string][]> {
  let isEncrypted = result.isDecrypted || result.fields.reduce(
    (acc, field) => acc || (field.isEncrypted && field.value === undefined),
    false
  )
  if (isEncrypted) {
    result = await StoredSafeActions.decrypt(result.host, result.id)
  }
  return result.fields.map(field => [field.name, field.value])
}


/**
 * Convert the URL from the tab that initiated the flow to a more
 * easily identifiable version.
 *
 * Attempts to strip random elements of the URL such as URL parameters.
 *
 * @param url URL of tab that initiated save flow.
 */
export function simplifyUrl (url: string): string {
  return url.split('?')[0]
}

export function stripUrlPath (url: string): string {
  const match = url.match(/(?:.+?:\/\/)?.*\//)?.[0] ?? url
  return match
}

export async function shouldSave (
  tab: browser.tabs.Tab,
  data: [string, string][]
): Promise<boolean> {
  // Don't save if there is no password/pincode
  if (
    data.findIndex(
      ([key, value]) =>
        (key === 'password' || key === 'pincode') && value?.length > 0
    ) === -1
  )
    return
  // Don't save if the user is offline
  const isOnline = await checkOnlineStatus()
  if (!isOnline) return false

  // Don't save if the URL is in the ignore list
  const url = tab.url
  const ignoreList = await IgnoreActions.fetch()
  const isIgnore = ignoreList.reduce(
    (isIgnore, host) => isIgnore || new RegExp(host).test(url),
    false
  )
  if (isIgnore) return false

  const values = new Map(data)

  // Don't save if a matching result already exists
  // TODO: Consider an option to save next time popup is opened
  const results = await TabHandler.GetResults(tab.id)
  for (const result of results) {
    for (const { value } of result.fields) {
      if (value === undefined) continue
      const fieldURL = simplifyUrl(url)
      // Check both ways if one is more specific than the other
      if (value.match(fieldURL) !== null || fieldURL.match(value) !== null) {
        const username = result.fields.find(({ name }) => name === 'username')
          .value
        if (username === values.get('username')) {
          return false
        }
      }
    }
  }

  return true
}

/**
 * Get the identifiers for the last result used on the provided URL.
 * @param url URL related to the fill flow.
 */
export async function getLastUsedResult (
  url: string
): Promise<{ host: string; objectId: string }> {
  const preferences = await PreferencesActions.fetch()
  const lastUsedResults = new Map(preferences.lastUsedResults)
  return lastUsedResults.get(stripUrlPath(url))
}

/**
 * Remember which result was used for fill so that the same result can be used
 * for automatic fill on later visits.
 * @param url URL related to the fill flow.
 * @param result Chosen result to use for fill.
 */
export async function setLastUsedResult (url: string, result: SSObject) {
  PreferencesActions.setLastUsedResult(stripUrlPath(url), result.host, result.id)
}
