import { StoredSafeObject, StoredSafeTemplate } from 'storedsafe';

export interface SearchResult {
  ssObject: StoredSafeObject;
  ssTemplate: StoredSafeTemplate;
}

/**
 * Search results object.
 * */
export interface SearchResults {
  [url: string]: {
    loading: boolean;
    results: SearchResult[];
  };
}

/**
 * Get search results from local storage.
 * @return {SearchResults} Promise containing SearchResults object.
 * */
const get = (): Promise<SearchResults> => (
  browser.storage.local.get('search')
  .then(({ search }) => {
    return search || {};
  })
)

/**
 * Commit SearchResults object to local storage.
 * @param search New SearchResults object.
 * */
const set = (search: SearchResults): Promise<void> => {
  return browser.storage.local.set({ search });
}

export const actions = {
  /**
   * Load search results for site.
   * */
  setLoading: (url: string): Promise<SearchResults> => {
    return get().then((searchResults) => {
      const newSearchResults = {
        ...searchResults,
        [url]: { loading: true, results: [] as SearchResult[] },
      };
      return set(newSearchResults).then(() => get());
    })
  },

  /**
   * Set search results for site.
   * */
  setResults: (url: string, results: SearchResult[]): Promise<SearchResults> => {
    return get().then((searchResults) => {
      const newSearchResults = {
        ...searchResults,
        [url]: { loading: false, results },
      };
      return set(newSearchResults).then(() => get());
    })
  },

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
