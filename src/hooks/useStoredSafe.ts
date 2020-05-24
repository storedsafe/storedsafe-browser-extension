// import { useState } from 'react';
// import { StoredSafeResponse } from 'storedsafe';
// import { actions } from '../model/StoredSafe';
// import { SearchResults } from '../model/Search';

// type State = {
  // [url: string]: {
    // loading: boolean;
    // results: SearchResults;
  // }
// };

// type Action = {
  // type: 'find';
  // needle: string
// };

// type StoredSafeHook = [
  // State,
  // (action: Action) => void,
// ]

// const useStoredSafe = (): StoredSafeHook => {
  // const [state, setState] = useState<State>({});

  // const dispatch = (action: Action): void => {
    // if (action.type === 'find') {
      // const { needle } = action;
      // actions.find(needle).then((searchPromises) => {
        // const newState: State = {};
        // Object.keys(searchPromises).forEach((url) => {
          // newState[url] = { loading: true, results: [] as SearchResults };
        // });
        // setState(newState);
        // Object.keys(searchPromises).forEach((url) => {
          // const promise = searchPromises[url];
          // promise.then((data) => {
            // newState[url] = { loading: false, results: data };
            // setState(newState);
          // });
        // });
      // });
    // }
  // };

  // return [state, dispatch];
// };
