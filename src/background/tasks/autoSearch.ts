import * as psl from "psl";
import { vault } from "@/global/api";
import { Logger } from "@/global/logger";
import { sessions } from "@/global/storage";
import type { FormType } from "@/content_script/tasks/scanner";
import { StoredSafeInvalidTokenError } from "@/global/errors";

const logger = new Logger("autosearch");

/**
 * Extract a search string from the url so that relevant results can be
 * searched for in StoredSafe.
 *
 * Returns the original URL if no match was found.
 * @param url Full URL
 */
export function urlToNeedle(urlString: string): string {
  const url = new URL(urlString);

  // Default, return the whole FQDN
  let hostname = url.hostname;

  // If it's not a valid global domain, return hostname.
  // This includes for example IP-addresses and localhost.
  if (!psl.isValid(url.hostname)) hostname = url.hostname;
  else {
    // Extract parts based on Mozilla's Public Suffix List
    const parts = psl.parse(url.hostname);
    if ("error" in parts) {
      hostname = url.hostname;
    }

    // Approach 1: Only remove www from FQDN
    // else if (parts.subdomain === "www" && parts.domain) {
    //   hostname = parts.domain;
    // }

    // Approach 2: Remove all subdomains from FQDN
    // else if (parts.subdomain && parts.domain) {
    //   hostname = parts.domain;
    // }
  }

  // if (url.port) {
  //   return `${hostname}:${url.port}`;
  // }
  return hostname;
}

interface URLParts extends Record<string, string> {
  protocol: string;
  subdomain: string;
  domain: string;
  tld: string;
  port: string;
  path: string;
  params: string;
}

function getParts(urlString: string): URLParts {
  const url = new URL(urlString);
  const protocol = url.protocol;
  const port = url.port;
  const path = url.pathname;
  const params = url.search;

  let subdomain = "";
  let domain = url.hostname;
  let tld = "";
  if (psl.isValid(url.hostname)) {
    const parts = psl.parse(protocol) as psl.ParsedDomain;
    subdomain = parts.subdomain ?? "";
    domain = parts.sld ?? "";
    tld = parts.tld ?? "";
  }

  return { protocol, subdomain, domain, tld, port, path, params };
}

function calculateScore(url: string, other: string) {
  let [partsUrl, partsOther] = [url, other].map(getParts);
  let score = 0;
  for (const prop in partsUrl) {
    // If url part is undefined but compare part is not
    if (partsUrl[prop].length === 0 && partsOther[prop].length > 0) {
      score -= 0.9;
      continue;
    }
    // If url part is defined, add if match, subtract if not
    if (partsOther[prop] === partsUrl[prop]) score += 1;
    else if (partsOther[prop].length > 0) score -= 0.9;
  }
  return score;
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
    const scoreA = calculateScore(url, a);
    const scoreB = calculateScore(url, b);
    return scoreB - scoreA;
  };
}

/**
 * Find matching URLs in the provided fields.
 * @param fields Fields of the result object.
 * @param needle The needle that was used for the search.
 */
function getURL(fields: StoredSafeField[], url: string): string {
  const protocol = new URL(url).protocol;
  const needle = urlToNeedle(url);
  const comparator = urlComparator(url);
  const values: string[] = [];
  for (const field of fields) {
    if (field.value === undefined) continue;
    // Get matched value with surrounding non-whitespace
    const matches = field.value.match(new RegExp(`\\S*${needle}\\S*`, "ig"));
    // If there is no match in the field, continue
    if (matches === null) continue;
    // Filter out values that contain only matches with e-mails
    if (
      matches.reduce(
        (isEmail, match) => isEmail && match.match("@") !== null,
        true
      )
    )
      continue;
    // Extract URL-like elements
    const urlMatcher =
      /(?:\w+:\/\/)?(?:www\w*\.)?(?:[\w\-\.]+)+(?:\/[\w\-]+)*/gi;
    const urls: string[] = [];
    for (const match of matches) {
      const urlMatch = match.match(urlMatcher);
      if (urlMatch !== null) {
        let matchedUrl = urlMatch[0];
        if (!matchedUrl.match(/^\w+:\/\//)) {
          matchedUrl = protocol + matchedUrl;
        }
        urls.push(matchedUrl);
      }
    }
    // Push the URL-like elements that match the needle
    values.push(...urls.filter((url) => url.match(needle) !== null));
  }
  return values.sort(comparator)[0] || "";
}

function resultComparator(url: string) {
  const comparator = urlComparator(url);
  return function (a: StoredSafeObject, b: StoredSafeObject) {
    const valueA = getURL(a.fields, url);
    const valueB = getURL(b.fields, url);
    if (valueA === valueB) return 0;
    if (valueA === undefined) return 1;
    if (valueB === undefined) return -1;
    return comparator(valueA, valueB);
  };
}

/**
 * Filter out results that have a different subdomain than the provided URL.
 * Will keep URLs that don't have a subdomain.
 * @param results All StoredSafe results matching the needle.
 * @param url The url used to generate the needle.
 */
function filterOtherSubdomain(results: StoredSafeObject[], url: string) {
  const parts = getParts(url);
  return results.filter((result) => {
    const fieldURL = getURL(result.fields, url);
    const fieldParts = getParts(fieldURL);
    // Return URLs without subdomain
    if (fieldParts.subdomain === "") return true;
    // Return true if match
    return fieldParts.subdomain === parts.subdomain;
  });
}

/**
 * Perform a search in StoredSafe for objects that may be relevant
 * to the current tab.
 *
 * Will rank and sort the results by most likely to be relevant
 * depending on how well they match the current tab URL.
 *
 * Will ignore StoredSafe fields with emails containing the domain in them.
 *
 * TODO: Filter searches based on form types
 *
 * @param url The URL of the current tab.
 * @param formTypes The types of forms that were detected on the current tab.
 * @param hosts The StoredSafe hosts to search. Will search all if null.
 * @returns List of probably relevant StoredSafe objects.
 */
export async function autoSearch(
  url: string,
  formTypes: FormType[],
  hosts: string[] | null = null
): Promise<StoredSafeObject[]> {
  if (!url.match(/^http/)) return [];
  const needle = urlToNeedle(url);
  if (!needle) return [];

  const currentSessions = await sessions.get();
  if (hosts) {
    // Only search the hosts that need updating
    for (const host of currentSessions.keys()) {
      if (!hosts.includes(host)) currentSessions.delete(host);
    }
  }

  let results: StoredSafeObject[] = [];
  for (const [host, { token }] of currentSessions) {
    try {
      results = [...results, ...(await vault.search(host, token, needle))];
    } catch (error) {
      if (error instanceof StoredSafeInvalidTokenError) {
        logger.warn(`Session for ${host} is no longer valid, skipping search.`);
      } else {
        logger.error("Unable to perform search on %s, %o", host, error);
      }
    }
  }

  // Remove results without username fields
  results = results.filter(
    (result) =>
      result.fields.findIndex((field) => field.name === "username") !== -1
  );
  // Remove results without URLs
  results = results.filter((result) => getURL(result.fields, url).length > 0);
  // Remove results that have a differing subdomain
  results = filterOtherSubdomain(results, url);
  // Sort by best match
  const comparator = resultComparator(url);
  return results.sort(comparator);
}
