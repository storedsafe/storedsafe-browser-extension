/**
 * Information about a field in a search result.
 * */
export interface SearchResultField {
  title: string;
  value?: string;
  isEncrypted: boolean;
  isDecrypted: boolean;
  isPassword: boolean;
}

/**
 * Information about each field in a search result.
 * */
export interface SearchResultFields {
  [field: string]: SearchResultField;
}

/**
 * Individual search result.
 * */
export interface SearchResult {
  name: string;
  type: string;
  icon: string;
  fields: SearchResultFields;
}

/**
 * Search results retrieved from site.
 * */
export interface SiteSearchResults {
  [objectId: string]: SearchResult;
}

/**
 * All search results across all searched sites.
 * */
export interface SearchResults {
  [url: string]: SiteSearchResults;
}

/**
 * Get search results from local storage.
 * @return {SearchResults} Promise containing SearchResults object.
 * */
function get (): Promise<SearchResults> {
  return browser.storage.local.get('search').then(({
    search
  }) => {
    return search || {};
  })
}

/**
 * Commit SearchResults object to local storage.
 * @param search New SearchResults object.
 * */
function set (search: SearchResults): Promise<void> {
  return browser.storage.local.set({
    search
  });
}

export const actions = {
  /**
   * Set search results for site.
   * */
  setResults: (
    url: string,
    results: SiteSearchResults
  ): Promise<SearchResults> => (
    get().then((searchResults) => {
      const newSearchResults = {
        ...searchResults,
        [url]: results,
      };
      return set(newSearchResults).then(get);
    })
  ),

  /**
   * Clear search results from storage.
   * */
  clear: (): Promise<SearchResults> => {
    return set({}).then(get);
  },

  /**
   * Fetch sessions from storage.
   * */
  fetch: get,
};
