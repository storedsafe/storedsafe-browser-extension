/**
 * Information about a field in a search result.
 * */
export interface SearchResultField {
  title: string;
  value?: string;
  isEncrypted: boolean;
  isShowing?: boolean; // Revealed in UI
  isPassword: boolean; // Formatted as password when shown.
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
  isDecrypted: boolean;
  fields: SearchResultFields;
}

/**
 * Search results retrieved from site.
 * */
export interface SiteSearchResults {
  error?: Error;
  objects: {
    [objectId: string]: SearchResult;
  };
}

/**
 * All search results across all searched sites.
 * */
export interface SearchResults {
  [url: string]: SiteSearchResults;
}

/**
 * Search storage object for background searches per tab.
 * NOTE: Manual searches should use the data structures above but are
 *       not persistent and should therefore not be stored here.
 * */
export interface Search {
  [tabId: number]: SearchResults;
}

/**
 * Get search results from local storage.
 * @return {Search} Promise containing Search object.
 * */
function get (): Promise<Search> {
  return browser.storage.local.get('search').then(({
    search
  }) => {
    return search || {};
  })
}

/**
 * Commit Search object to local storage.
 * @param {Search} search New Search object.
 * */
function set (search: Search): Promise<void> {
  return browser.storage.local.set({
    search,
  });
}

export const actions = {
  /**
   * Set search results for tab.
   * */
  setTabResults: (
    tabId: number,
    searchResults: SearchResults
  ): Promise<Search> => (
    get().then((prevSearchResults) => {
      const newSearchResults = {
        ...prevSearchResults,
        [tabId]: searchResults,
      };
      return set(newSearchResults).then(get);
    })
  ),

  /**
   * Clear search results from storage.
   * */
  clear: (): Promise<Search> => {
    return set({}).then(get);
  },

  /**
   * Fetch search from storage.
   * */
  fetch: get,
};
