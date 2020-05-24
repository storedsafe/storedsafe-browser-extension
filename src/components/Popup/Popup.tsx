import React, { useState } from 'react';
import { actions as storedsafe } from '../../model/StoredSafe';
import {SearchResults } from '../../model/Search';
import * as PopupUI from '../ui/Popup';
import { useStorage } from '../../hooks/useStorage';

export const Popup: React.FunctionComponent = () => {
  const { state, dispatch, isInitialized } = useStorage();
  const [searchTimeout, setSearchTimeout] = useState<number>();
  const [results, setResults] = useState<SearchResults>({});

  const openOptions = browser.runtime.openOptionsPage;

  const onSearch = (needle: string): void => {
    if (searchTimeout) setSearchTimeout(undefined);
    Object.keys(state.sessions).forEach((url) => {
      dispatch({
        search: {
          type: 'find',
          needle,
          url,
          session: state.sessions[url],
        },
      });
    });
  };

  const onNeedleChange = (needle: string): void => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchTimeout(window.setTimeout((): void => onSearch(needle), 1500));
  };

  const decrypt = (url: string, objectId: string, field: string): void => {
    dispatch({
      search: {
        type: 'decrypt',
        url,
        id: objectId,
        session: state.sessions[url],
      },
    });
  };

  return (
    <PopupUI.Main
      isLoading={isInitialized}
      search={{
        onSearch,
        onNeedleChange,
        results: state.search,
      }}
      openOptions={openOptions}
    />
  );
};
