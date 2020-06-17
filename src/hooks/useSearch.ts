import { useState, useEffect, useCallback } from 'react';
import {
  OnShowCallback,
  OnCopyCallback,
  OnFillCallback,
  OnNeedleChangeCallback,
  OnSearchCallback
} from '../components/Search';
import { SearchStatus } from '../components/Popup';
import { useStorage } from './useStorage';

interface SearchHook {
  needle: string;
  onNeedleChange: OnNeedleChangeCallback;
  onSearch: OnSearchCallback;
  onShow: OnShowCallback;
  onCopy: OnCopyCallback;
  onFill: OnFillCallback;
  searchStatus: SearchStatus;
}

export const useSearch = (): SearchHook => {
  const { state, dispatch } = useStorage();
  const [needle, setNeedle] = useState<string>('');
  const [searching, setSearching] = useState<string>('');
  const [searchStatus, setSearchStatus] = useState<SearchStatus>({});

  const onNeedleChange: OnNeedleChangeCallback = (needle) => {
    setNeedle(needle);
  };

  const onSearch = useCallback<OnSearchCallback>(() => {
    setSearching(needle);
    console.log('Search', needle);
    for (const host of state.sessions.keys()) {
      console.log('Searching site', host);
      setSearchStatus((prevSearchStatus) => ({
        ...prevSearchStatus,
        [host]: {
          loading: true,
        },
      }));
      dispatch({
        search: {
          type: 'find',
          host,
          needle,
        },
      }, {
        onSuccess: (res) => {
          console.log('SUCCESS', res.search);
          setSearchStatus((prevSearchStatus) => ({
            ...prevSearchStatus,
            [host]: {
              loading: false,
            },
          }));
        },
        onError: (error) => {
          console.log('ERROR', error);
          setSearchStatus((prevSearchStatus) => ({
            ...prevSearchStatus,
            [host]: {
              loading: false,
              error: error.message,
            },
          }));
        },
      });
    }
  }, [needle, dispatch, state.sessions]);

  const onShow: OnShowCallback = (host, resultId, fieldId) => {
    dispatch({
      search: {
        type: 'show',
        results: state.search,
        host,
        resultId,
        fieldId,
      },
    });
  };

  const onCopy: OnCopyCallback = (host, resultId, fieldId) => {
    const copy = (value: string): void => {
      // TODO: More reliable copy in background script.
      // browser.runtime.sendMessage({ type: 'copy', value });
      navigator.clipboard.writeText(value).then(() => {
        setTimeout(() => {
          navigator.clipboard.writeText('');
        }, 30000);
      });
    };

    // Only decrypt if needed
    const ssObject = state.search.get(host)[resultId];
    const isEncryptedField = ssObject.fields[fieldId].isEncrypted;
    const isDecrypted = ssObject.isDecrypted;
    if (!isEncryptedField || isDecrypted) {
      copy(ssObject.fields[fieldId].value);
    } else {
      dispatch({
        search: {
          type: 'decrypt',
          results: state.search,
          host,
          resultId,
        },
      }, {
        onSuccess: (newState) => {
          copy(newState.search.get(host)[resultId].fields[fieldId].value);
        },
      });
    }
  };

  const onFill: OnFillCallback = (host, resultId) => {
    const fill = (data: Map<string, string>): void => {
      browser.tabs.query({
        currentWindow: true,
        active: true,
      }).then(([tab]) => {
        browser.tabs.sendMessage(tab.id, {
          type: 'fill',
          data: [...data],
        }).then(() => {
          window.close();
        });
      });
    };

    // Only decrypt if needed
    if (!state.search.get(host)[resultId].isDecrypted) {
      dispatch({
        search: {
          type: 'decrypt',
          results: state.search,
          host,
          resultId,
        },
      }, {
        onSuccess: (newState) => {
          const fields = newState.search.get(host)[resultId].fields;
          const data: Map<string, string> = new Map();
          for (const field of fields) {
            data.set(field.name, field.value);
          }
          fill(data);
        },
      });
    } else {
      const fields = state.search.get(host)[resultId].fields;
      const data: Map<string, string> = new Map();
      for (const field of fields) {
        data.set(field.name, field.value);
      }
      fill(data);
    }
  };

  useEffect(() => {
    const search = (): void => {
      if (searching !== needle) {
        onSearch();
      }
    };
    // Search when there's 500ms since the last keystroke.
    const id = setTimeout(search, 500);
    return (): void => clearTimeout(id);
  }, [needle, searching, onSearch]);

  return {
    needle,
    onNeedleChange,
    onSearch,
    onShow,
    onCopy,
    onFill,
    searchStatus,
  };
};
