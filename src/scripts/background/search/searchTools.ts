import { actions as StoredSafeActions } from '../../../model/storedsafe/StoredSafe'

/**
 * Extract a search string from the url so that relevant results can be
 * searched for in StoredSafe.
 *
 * Returns the original URL if no match was found.
 * @param url Full URL
 */
export function urlToNeedle (url: string): string {
  const match = url.match(/(?:\w+:\/\/)?(?:www\.)?(?<needle>[\w\.]+)/)
  return match?.groups['needle']
}

/**
 * Match one url against another to see if the other URl contains the first one.
 * @param url The URL to be matched.
 * @param other The URL (or partial URL) to be matched against.
 */
export function matchUrl (url: string, other: string): boolean {
  return new RegExp(other).test(url)
}

/**
 * Create a comparator function to match against a given URL.
 *
 * Compatible with Array.sort, returns a positive number if the first URL is
 * a better match and a negative number if the other URL is the better match
 * or 0 if they're both equally good matches.
 *
 * // TODO: Test and improve
 *
 * @param url URL or partial URL to be matched against in the comparator.
 */
export function urlComparator (url: string): (a: string, b: string) => number {
  return function (a: string, b: string): number {
    // If they're the same, the URL doesn't matter
    if (a === b) return 0

    // They're not the same, go in order of appearance for exact match
    if (a === url) return 1
    if (b === url) return -1

    // Same as above but with URL parameters removed
    const [urlNoParams, aNoParams, bNoParams] = [url, a, b].map(
      url => url.split('?')[0]
    )
    if (aNoParams !== bNoParams) {
      if (aNoParams === urlNoParams) return 1
      if (bNoParams === urlNoParams) return -1
    }

    // Same as above but with protocol removed
    const [urlNoProtocol, aNoProtocol, bNoProtocol] = [
      urlNoParams,
      aNoParams,
      bNoParams
    ].map(url => {
      const match = url.match(/(?:\w+:\/\/)?(?<noProtocol>.*)/)
      if (match?.groups === undefined) return url
      return match.groups.noProtocol
    })
    if (aNoProtocol !== bNoProtocol) {
      if (aNoProtocol === urlNoProtocol) return 1
      if (bNoProtocol === urlNoProtocol) return -1
    }

    // Same as above but only FQDN
    const [fqdn, fqdnA, fqdnB] = [urlNoProtocol, aNoProtocol, bNoProtocol].map(
      url => {
        const match = url.match(/(?:\w+:\/\/)?(?:www\.)?(?<fqdn>[\w+\.]+)/)
        if (match?.groups === undefined) return url
        return match.groups.fqdn
      }
    )
    if (fqdnA !== fqdnB) {
      if (fqdnA === fqdn) return 1
      if (fqdnB === fqdn) return -1
    }

    // Last resort, go by portion of string matched
    const matchA = a.match(url) || ''
    const matchB = b.match(url) || ''
    const scoreA = matchA.length / a.length
    const scoreB = matchB.length / b.length
    return scoreA - scoreB
  }
}
