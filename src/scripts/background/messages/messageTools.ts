import { actions as IgnoreActions } from '../../../model/storage/Ignore'
import { checkOnlineStatus } from '../sessions/sessionTools'
import { TabHandler } from '../search'

/**
 * Convert the URL from the tab that initiated the save flow to a more
 * easily identifiable version.
 *
 * Attempts to strip random elements of the URL such as URL parameters.
 *
 * @param url URL of tab that initiated save flow.
 */
export function saveURLToField (url: string) {
  return url.split('?')[0]
}

export async function shouldSave (
  tab: browser.tabs.Tab,
  data: [string, string][]
): Promise<boolean> {
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
  const results = TabHandler.GetResults(tab.id)
  console.log('RESULTS', results)
  for (const result of results) {
    for (const { value } of result.fields) {
      if (value === undefined) continue
      const fieldURL = saveURLToField(url)
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
