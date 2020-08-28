import { actions as IgnoreActions } from '../../../model/storage/Ignore'
import { actions as TabResultsActions } from '../../../model/storage/TabResults'
import { checkOnlineStatus } from '../sessions/sessionTools'

/**
 * Convert the URL from the tab that initiated the save flow to a more
 * easily identifiable version.
 *
 * Attempts to strip random elements of the URL such as URL parameters.
 *
 * @param url URL of tab that initiated save flow.
 */
export function saveURLToField(url: string) {
  return url.split('?')[0]
}

export async function shouldSave (url: string, data: [string, string][]): Promise<boolean> {
  // Don't save if the user is offline
  const isOnline = await checkOnlineStatus()
  if (!isOnline) return false

  // Don't save if the URL is in the ignore list
  const ignoreList = await IgnoreActions.fetch()
  const isIgnore = ignoreList.reduce(
    (isIgnore, host) => isIgnore || new RegExp(host).test(url),
    false
  )
  if (isIgnore) return false

  const values = new Map(data)

  // Don't save if a matching result already exists
  // TODO: Consider an option to save next time popup is opened
  // TODO: Refactor after results are refactored
  const tabResults = await TabResultsActions.fetch()
  for (const results of tabResults.values()) {
    for (const ssObjects of results.values()) {
      for (const ssObject of ssObjects) {
        for (const { value } of ssObject.fields) {
          if (value === undefined) continue
          const fieldURL = saveURLToField(url)
          // Check both ways if one is more specific than the other
          if (value.match(fieldURL) !== null || fieldURL.match(value) !== null) {
            const username = ssObject.fields.find(
              ({ name }) => name === 'username'
            ).value
            if (username === values.get('username')) {
              return false
            }
          }
        }
      }
    }
  }

  return true
}
