import { actions as SessionsActions } from '../../../model/storage/Sessions'
import { actions as StoredSafeActions } from '../../../model/storedsafe/StoredSafe'
import { logger } from '.'

function getFQDN (url: string) {
  const match = url.match(/(?:\w+:\/\/)?(?:www\.)?(?<fqdn>[\w\.]+)/)
  return match?.groups['fqdn']
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
export function urlToNeedle (url: string): string {
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
  let parts, protocol, subdomain, domain, tld, port, path, params

  // Extract URL parameters
  ;[url, params] = url.split('?')

  // Extract protocol
  parts = url.split('://')
  if (parts.length > 1) [protocol, url] = parts

  // Extract path
  ;[url, ...parts] = url.split('/')
  path = parts.join('/')

  ;[url, ...parts] = url.split(':')
  port = parts[0]

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

  // Split subdomain and domain
  domain = parts.splice(last--)[0]
  subdomain = parts.join('.')

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
function urlComparator (url: string): (a: string, b: string) => number {
  return function (a: string, b: string): number {
    let [partsA, partsB, partsUrl] = [a, b, url].map(getParts)
    let scoreA = 0, scoreB = 0

    for (const prop in partsUrl) {
      if (partsUrl[prop] === undefined || partsUrl[prop].length === 0) continue
      if (partsA[prop] === partsUrl[prop]) scoreA++
      else if (partsA[prop] !== undefined && partsA[prop].length > 0) scoreA -= 0.9
      if (partsB[prop] === partsUrl[prop]) scoreB++
      else if (partsB[prop] !== undefined && partsB[prop].length > 0) scoreB -= 0.9
    }

    return scoreB - scoreA
  }
}

/**
 * Find the field that matches the needle.
 * @param fields Fields of the result object.
 * @param needle The needle that was used for the search.
 */
function getMatchFieldValue(fields: SSField[], url: string): string {
  const needle = urlToNeedle(url)
  const comparator = urlComparator(url)
  const values: string[] = []
  for (const field of fields) {
    if (field.value?.match(needle) !== null) values.push(field.value)
  }
  return values.sort(comparator)[0]
}

function resultComparator(url: string) {
  const needle = urlToNeedle(url)
  const comparator = urlComparator(url)
  return function (a: SSObject, b: SSObject) {
    const valueA = getMatchFieldValue(a.fields, url)
    const valueB = getMatchFieldValue(b.fields, url)
    if (valueA === valueB) return 0
    if (valueA === undefined) return 1
    if (valueB === undefined) return -1
    return comparator(valueA, valueB)
  }
}

/**
 * Filter out results that only matched on e-mail addresses.
 * @param results All StoredSafe results matching the needle.
 * @param needle The needle used for the search.
 */
function filterEmail(results: SSObject[], needle: string) {
  return results.filter(result => {
    let isMatch = false
    console.log('CHECK MATCH')
    for (const field of result.fields) {
      if (field.value === undefined) continue
      isMatch = isMatch || field.value.match(new RegExp(`[^@]${needle}`, 'i')) !== null
      console.log(field.name, field.value, isMatch)
    }
    return isMatch
  })
}

export async function find(url: string): Promise<SSObject[]> {
  const needle = urlToNeedle(url)
  const sessions = await SessionsActions.fetch()
  let results: SSObject[] = []
  for (const [host] of sessions) {
    try {
      results = [...results, ...await StoredSafeActions.find(host, needle)]
    } catch (error) {
      logger.error('Unable to perform search on %s, %o', host, error)
    }
  }
  results = filterEmail(results, needle)
  const comparator = resultComparator(url)
  return results.sort(comparator)
}