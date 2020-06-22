import PromiseReducer from './PromiseReducer';
import { actions as TabResultsActions } from '../model/storage/TabResults';
import { actions as StoredSafeActions } from '../model/storedsafe/StoredSafe';

export type State = Results;
export type Action = {
  type: 'clear-find';
} | {
  type: 'find';
  needle: string;
  host: string;
} | {
  type: 'show';
  results: Results;
  host: string;
  resultId: number;
  fieldId: number;
  show?: boolean;
} | {
  type: 'decrypt';
  results: Results;
  host: string;
  resultId: number;
} | {
  type: 'fetchSiteInfo';
  host: string;
} | {
  type: 'add';
  host: string;
  templateId: string;
  groupId: string;
  params: object;
};

export const reducer: PromiseReducer<State, Action> = (action) => {
  /**
   * Get results from the active tab if they exist.
   * */
  function init(): Promise<State> {
    return browser.tabs.query({
      active: true,
      currentWindow: true,
    }).then(([tab]) => {
      return TabResultsActions.fetch().then((results) => (
        results.get(tab.id) || new Map()
      ));
    });
  }

  /**
   * Decrypt search result object.
   * @param host - Host server to request decryption from.
   * @param encryptedResult - Previous, encrypted result object.
   * */
  function decrypt(
    host: string,
    encryptedResult: SSObject
  ): Promise<SSObject> {
    return StoredSafeActions.decrypt(
      host, encryptedResult.id
    ).then((result) => {
      result.fields.forEach((field) => {
        const prevField = encryptedResult.fields.find(({ name }) => (
          name === field.name
        ));
        field.isShowing = prevField.isShowing;
      });
      return result;
    });
  }

  /**
   * Helper function to merge a decrypted result into the previous state.
   * @param host - Host the result belongs to.
   * @param result - The result to merge into the previous state.
   * */
  function mergeResults(
    host: string,
    result: SSObject
  ): (state: State) => State {
    return (prevState: State): State => {
      const hostResults = [...prevState.get(host)];
      const prevResultId = hostResults.findIndex(({ id }) => (
        id === result.id
      ));
      hostResults[prevResultId] = result;
      return new Map([...prevState, [host, hostResults]])
    };
  }

  switch(action.type) {
    /**
     * Clear manual results before new search.
     * */
    case 'clear-find': {
      return Promise.resolve(new Map());
    }

    /**
     * Perform manual search on provided sites.
     * */
    case 'find': {
      const { host, needle } = action;
      if (needle === '') {
        return init();
      }
      return StoredSafeActions.find(host, needle).then((results) => (
        (state: State): State => {
          return new Map([...state, [host, results]]);
        }
      ));
    }

    /**
     * Show/hide hidden field in result.
     * Decrypts object first if object isn't already decrypted.
     * */
    case 'show': {
      const { results, host, resultId, fieldId } = action;
      const show = action.show || true;
      const encryptedResult = results.get(host)[resultId];
      if (show && !encryptedResult.isDecrypted) {
        return decrypt(host, encryptedResult).then((result) => {
          result.fields[fieldId].isShowing = true;
          return mergeResults(host, result);
        });
      }
      return Promise.resolve((prevState: State) => {
        const newState = new Map([...prevState]);
        newState.get(host)[resultId].fields[fieldId].isShowing = show;
        return newState;
      });
    }

    /**
     * Decrypt object in results.
     * */
    case 'decrypt': {
      const { results, host, resultId } = action;
      const encryptedResult = results.get(host)[resultId];
      return decrypt(host, encryptedResult).then((result) => (
        mergeResults(host, result)
      ));
    }

    /**
     * Add object to StoredSafe.
     * */
    case 'add': {
      const { host, params } = action;
      return StoredSafeActions.addObject(host, params).then(() => (
        (prevState: State): State => prevState
      ));
    }

    case 'init': {
      return init();
    }
  }
};


export const emptyState: State = new Map();
