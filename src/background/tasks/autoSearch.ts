import { vault } from '../../global/api'
import { StoredSafeExtensionError } from '../../global/errors'
import { Logger } from '../../global/logger'
import { sessions } from '../../global/storage'

const logger = new Logger('autosearch')

function getFQDN(url: string) {
  const match = url.match(/(?:\w+:\/\/)?(?:www\.)?([\w\.]+)/)
  return match?.[1]
}

/**
 * Extract a search string from the url so that relevant results can be
 * searched for in StoredSafe.
 *
 * Uses special hardcoded case for two two-part TLDs.
 * For potential refactor in the future, take a look at https://github.com/lupomontero/psl
 *
 * Returns the original URL if no match was found.
 * @param url Full URL
 */
export function urlToNeedle(url: string): string {
  const fqdn = getFQDN(url)
  if (fqdn === undefined) return url
  const parts = fqdn.split('.')

  if (parts.length === 1) return fqdn

  const tld: string[] = []
  tld.push(parts.pop())
  if (['org', 'co'].includes(parts[parts.length - 1])) tld.push(parts.pop())
  const domain = [parts[parts.length - 1], ...tld].join('.')
  return domain
}

interface URLParts extends Record<string, string> {
  protocol: string
  subdomain: string
  domain: string
  tld: string
  port: string
  path: string
  params: string
}

function getParts(url: string): URLParts {
  let parts,
    protocol,
    subdomain,
    domain,
    tld,
    port,
    path,
    params

    // Extract URL parameters
    ;[url, params] = url.split('?')
  params = params || ''

  // Extract protocol
  parts = url.split('://')
  if (parts.length > 1) [protocol, url] = parts
  protocol = protocol || ''

    // Extract path
    ;[url, ...parts] = url.split('/')
  path = parts.join('/') || ''
    ;[url, ...parts] = url.split(':')
  port = parts[0] || ''

  // Extract tld
  parts = url.split('.')
  let last = parts.length - 1
  if (parts.length > 1) {
    ;[tld] = parts.splice(last--)
    // Add secondary tld part if it exists
    if (['co', 'org'].includes(parts[last])) {
      tld = [parts.splice(last--)[0], tld].join('.')
    }
  }
  tld = tld || ''

  // Split subdomain and domain
  domain = parts.splice(last--)[0] || ''
  subdomain = parts.join('.') || ''

  return { protocol, subdomain, domain, tld, port, path, params }
}

/**
 * Create a comparator function to match against a given URL.
 *
 * Compatible with Array.sort, returns a negative number if the first URL is
 * a better match and a positive number if the other URL is the better match
 * or 0 if they're both equally good matches.
 *
 * @param url URL or partial URL to be matched against in the comparator.
 */
function urlComparator(url: string): (a: string, b: string) => number {
  return function (a: string, b: string): number {
    let [partsA, partsB, partsUrl] = [a, b, url].map(getParts)
    let scoreA = 0,
      scoreB = 0

    for (const prop in partsUrl) {
      // If url part is undefined but compare part is not
      if (partsUrl[prop] === undefined || partsUrl[prop].length === 0) {
        if (partsA[prop] !== undefined && partsA[prop].length > 0) scoreA -= 0.9
        if (partsB[prop] !== undefined && partsB[prop].length > 0) scoreB -= 0.9
        continue
      }
      // If url part is defined, add if match, subtract if not
      if (partsA[prop] === partsUrl[prop]) scoreA++
      else if (partsA[prop] !== undefined && partsA[prop].length > 0)
        scoreA -= 0.9
      if (partsB[prop] === partsUrl[prop]) scoreB++
      else if (partsB[prop] !== undefined && partsB[prop].length > 0)
        scoreB -= 0.9
    }
    return scoreB - scoreA
  }
}

/**
 * Find matching URLs in the provided fields.
 * @param fields Fields of the result object.
 * @param needle The needle that was used for the search.
 */
function getURL(fields: StoredSafeField[], url: string): string {
  const needle = urlToNeedle(url)
  const comparator = urlComparator(url)
  const values: string[] = []
  for (const field of fields) {
    if (field.value === undefined) continue
    // Get matched value with surrounding non-whitespace
    const matches = field.value.match(new RegExp(`\\S*${needle}\\S*`, 'ig'))
    // If there is no match in the field, continue
    if (matches === null) continue
    // Filter out values that contain only matches with e-mails
    if (
      matches.reduce(
        (isEmail, match) => isEmail && match.match('@') !== null,
        true
      )
    )
      continue
    // Extract URL-like elements
    const urlMatcher = /(?:\w+:\/\/)?(?:www\w*\.)?(?:[\w\-\.]+)+(?:\/[\w\-]+)*/gi
    const urls: string[] = []
    for (const match of matches) {
      const urlMatch = match.match(urlMatcher)
      if (urlMatch !== null) urls.push(urlMatch[0])
    }
    // Push the URL-like elements that match the needle
    values.push(...urls.filter(url => url.match(needle) !== null))
  }
  return values.sort(comparator)[0] || ''
}

function resultComparator(url: string) {
  const needle = urlToNeedle(url)
  const comparator = urlComparator(url)
  return function (a: StoredSafeObject, b: StoredSafeObject) {
    const valueA = getURL(a.fields, url)
    const valueB = getURL(b.fields, url)
    if (valueA === valueB) return 0
    if (valueA === undefined) return 1
    if (valueB === undefined) return -1
    return comparator(valueA, valueB)
  }
}

/**
 * Filter out results that have a different subdomain than the provided URL.
 * Will keep URLs that don't have a subdomain.
 * @param results All StoredSafe results matching the needle.
 * @param url The url used to generate the needle.
 */
function filterOtherSubdomain(results: StoredSafeObject[], url: string) {
  const parts = getParts(url)
  return results.filter(result => {
    const fieldURL = getURL(result.fields, url)
    const fieldParts = getParts(fieldURL)
    const isMatch =
      fieldParts.subdomain === ''
        ? true
        : fieldParts.subdomain === parts.subdomain
    if (isMatch) return isMatch
  })
}

async function find(
  url: string,
  hosts: string[] = null
): Promise<StoredSafeObject[]> {
  if (!url.match(/^http/)) return Promise.resolve([])
  const needle = urlToNeedle(url)
  if (!needle) return Promise.resolve([])

  const currentSessions = await sessions.get()
  if (!!hosts) {
    // Only search the hosts that need updating
    for (const host of currentSessions.keys()) {
      if (!hosts.includes(host)) currentSessions.delete(host)
    }
  }

  let results: StoredSafeObject[] = []
  for (const [host, { token }] of currentSessions) {
    try {
      results = [...results, ...(await vault.search(host, token, needle))]
    } catch (error) {
      logger.error('Unable to perform search on %s, %o', host, error)
    }
  }

  // Remove results without username fields
  results = results.filter(
    result => result.fields.findIndex(field => field.name === 'username') !== -1
  )
  // Remove results without URLs
  results = results.filter(result => getURL(result.fields, url).length > 0)
  // Remove results that have a differing subdomain
  results = filterOtherSubdomain(results, url)
  // Sort by best match
  const comparator = resultComparator(url)
  return results.sort(comparator)
}

export function autoSearch(
  onResultsChanged: (tabs: Map<number, StoredSafeObject[]>) => void
): () => void {
  const tabs: Map<
    number,
    { url: string; results: StoredSafeObject[]; isLoading: boolean }
  > = new Map()

  function onActivated(activeInfo: browser.tabs._OnActivatedActiveInfo): void {
    const tabId = activeInfo.tabId
    if (tabs.has(tabId)) return
    browser.tabs.get(tabId).then(tab => {
      onUpdated(tabId, { status: 'complete' }, tab)
    })
  }

  function onUpdated(
    tabId: number,
    changeInfo: browser.tabs._OnUpdatedChangeInfo,
    tab: browser.tabs.Tab
  ) {
    // Skip updates that are still loading
    if (changeInfo.status !== 'complete') {
      if (tabs.has(tabId)) {
        // Remove tab results while loading
        tabs.delete(tabId)
      }
      return
    }
    // Skip updates when there's no URL
    if (!tab.url) return
    // Skip updates if URL hasn't changed (saved URL cleared on loading change)
    if (tab.url === tabs.get(tabId)?.url) return

    // Get results for tab
    const tabHandler = {
      url: tab.url,
      results: [],
      isLoading: true
    }
    tabs.set(tabId, tabHandler)
    find(tab.url).then(results => {
      // In case a new search has been started before the first one ended
      if (tab.url === tabHandler.url) {
        tabHandler.results = results
        tabHandler.isLoading = false
        notify()
      }
    })
  }

  function onRemoved(tabId: number) {
    tabs.delete(tabId)
  }

  function onSessionsUpdated(
    newSessions: Map<string, Session>,
    oldSessions: Map<string, Session>
  ) {
    const newHosts = [...newSessions.keys()]
    const oldHosts = [...oldSessions.keys()]

    const addedHosts = newHosts.filter(host => !oldHosts.includes(host))
    const removedHosts = oldHosts.filter(host => !newHosts.includes(host))

    for (const tabHandler of tabs.values()) {
      // Remove results from invalidated sessions
      tabHandler.results = tabHandler.results.filter(
        ({ host }) => !removedHosts.includes(host)
      )
      notify()

      // Add results from new sessions
      tabHandler.isLoading = addedHosts.length > 0
      find(tabHandler.url, addedHosts).then(results => {
        tabHandler.results = [...tabHandler.results, ...results]
        tabHandler.isLoading = false
        notify()
      })
    }
  }

  function notify(): void {
    const updatedResults: Map<number, StoredSafeObject[]> = new Map()
    for (const [tabId, { results, isLoading }] of tabs) {
      if (!isLoading) {
        updatedResults.set(tabId, results)
      }
    }
    onResultsChanged(updatedResults)
  }

  browser.tabs.onActivated.addListener(onActivated)
  browser.tabs.onUpdated.addListener(onUpdated)
  browser.tabs.onRemoved.addListener(onRemoved)
  sessions.subscribe(onSessionsUpdated)

  return function stop() {
    browser.tabs.onActivated.removeListener(onActivated)
    browser.tabs.onUpdated.removeListener(onUpdated)
    browser.tabs.onRemoved.removeListener(onRemoved)
    sessions.unsubscribe(onSessionsUpdated)
  }
}
