import PromiseReducer from './PromiseReducer';
import { Session } from '../model/Sessions';
import { actions as search, SearchResults } from '../model/Search';
import { actions as storedsafe } from '../model/StoredSafe';

export type State = SearchResults;
export type Action = {
  type: 'find';
  needle: string;
  urls: string[];
} | {
  type: 'show';
  url: string;
  objectId: string;
  field: string;
  show?: boolean;
};

export const reducer: PromiseReducer<State, Action> = (state, action) => {
  /**
   * Get results from the active tab if they exist.
   * */
  const init = (): Promise<State> => {
    return browser.tabs.query({
      active: true,
      currentWindow: true,
    }).then(([tab]) => {
      return search.fetch().then((results) => (
        results[tab.id] || {}
      ));
    });
  }

  switch(action.type) {
    /**
     * Perform manual search on provided sites.
     * */
    case 'find': {
      const { urls, needle } = action;
      if (needle === '') {
        return init();
      }
      return storedsafe.find(urls, needle);
    }

    /**
     * Show/hide hidden field in result.
     * Decrypts object first if object isn't already decrypted.
     * */
    case 'show': {
      const { url, objectId, field } = action;
      const show = action.show || true;
      if (show && state[url].objects[objectId].isDecrypted) {
        return storedsafe.decrypt(url, objectId).then((decryptedResult) => {
          decryptedResult.fields[field].isShowing = true;
          const newState = { ...state };
          newState[url].objects[objectId] = decryptedResult;
          return newState;
        });
      }
      const newState = { ...state };
      newState[url].objects[objectId].fields[field].isShowing = show;
      return Promise.resolve(newState);
    }

    case 'init': {
      return init();
    }
  }
};


export const emptyState: State = {};
