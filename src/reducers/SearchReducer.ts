import PromiseReducer from './PromiseReducer';
import { Session } from '../model/Sessions';
import { actions as search, SearchResults } from '../model/Search';
import { actions as storedsafe } from '../model/StoredSafe';

export type State = SearchResults;
export type Action = {
  type: 'find';
  needle: string;
  url: string;
} | {
  type: 'show';
  url: string;
  objectId: string;
  field: string;
  show?: boolean;
} | {
  type: 'decrypt';
  url: string;
  objectId: string;
};

export const reducer: PromiseReducer<State, Action> = (state, action) => {
  /**
   * Get results from the active tab if they exist.
   * */
  function init(): Promise<State> {
    return browser.tabs.query({
      active: true,
      currentWindow: true,
    }).then(([tab]) => {
      return search.fetch().then((results) => (
        results[tab.id] || {}
      ));
    });
  }

  /**
   * Decrypt object in search results.
   * */
  function decrypt(url: string, objectId: string): Promise<State> {
    return storedsafe.decrypt(url, objectId).then((result) => ({
      ...state,
      [url]: {
        ...state[url],
        [objectId]: result,
      },
    }));
  }

  switch(action.type) {
    /**
     * Perform manual search on provided sites.
     * */
    case 'find': {
      const { url, needle } = action;
      if (needle === '') {
        return init();
      }
      return storedsafe.find(url, needle).then((results) => ({
        ...state,
        [url]: results,
      }));
    }

    /**
     * Show/hide hidden field in result.
     * Decrypts object first if object isn't already decrypted.
     * */
    case 'show': {
      const { url, objectId, field } = action;
      const show = action.show || true;
      if (show && !state[url][objectId].isDecrypted) {
        return decrypt(url, objectId).then((newState) => {
          newState[url][objectId].fields[field].isShowing = true;
          return newState;
        });
      }
      const newState = { ...state };
      newState[url][objectId].fields[field].isShowing = show;
      return Promise.resolve(newState);
    }

    case 'decrypt': {
      const { url, objectId } = action;
      return decrypt(url, objectId);
    }

    case 'init': {
      return init();
    }
  }
};


export const emptyState: State = {};
