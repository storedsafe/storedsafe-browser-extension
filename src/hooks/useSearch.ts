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
    Object.keys(state.sessions).forEach((url) => {
      setSearchStatus((prevSearchStatus) => ({
        ...prevSearchStatus,
        [url]: {
          loading: true,
        },
      }));
      dispatch({
        search: {
          type: 'find',
          url,
          needle,
        },
      }, {
        onSuccess: () => {
          setSearchStatus((prevSearchStatus) => ({
            ...prevSearchStatus,
            [url]: {
              loading: false,
            },
          }));
        },
        onError: (error) => {
          setSearchStatus((prevSearchStatus) => ({
            ...prevSearchStatus,
            [url]: {
              loading: false,
              error: error.message,
            },
          }));
        },
      });
    });
  }, [needle, dispatch, state.sessions]);

  const onShow: OnShowCallback = (url, objectId, field) => {
    dispatch({
      search: {
        type: 'show',
        url,
        objectId,
        field,
      },
    });
  };

  const onCopy: OnCopyCallback = (url, objectId, field) => {
    dispatch({
      search: {
        type: 'decrypt',
        url,
        objectId,
      },
    }, {
      onSuccess: (newState) => {
        const value = newState.search[url][objectId].fields[field].value;
        // TODO: More reliable copy in background script.
        // browser.runtime.sendMessage({ type: 'copy', value });
        navigator.clipboard.writeText(value).then(() => {
          setTimeout(() => {
            navigator.clipboard.writeText('');
          }, 30000);
        });
      },
    });
  };

  const onFill: OnFillCallback = (url, objectId) => {
    const fill = (data: { [field: string]: string }): void => {
      browser.tabs.query({ currentWindow: true, active: true }).then(([tab]) => {
        browser.tabs.sendMessage(tab.id, {
          type: 'fill',
          data: data,
        }).then(() => {
          window.close();
        });
      });
    };
    if (!state.search[url][objectId].isDecrypted) {
      dispatch({
        search: {
          type: 'decrypt',
          url,
          objectId,
        },
      }, {
        onSuccess: (newState) => {
          const fields = newState.search[url][objectId].fields;
          const data: { [field: string]: string } = {};
          Object.keys(fields).forEach((field) => {
            data[field] = fields[field].value;
          });
          fill(data);
        },
      });
    } else {
      const fields = state.search[url][objectId].fields;
      const data: { [field: string]: string } = {};
      Object.keys(fields).forEach((field) => {
        data[field] = fields[field].value;
      });
      fill(data);
    }
  };

  useEffect(() => {
    const search = (): void => {
      if (searching !== needle) {
        onSearch();
        setSearching(needle);
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
