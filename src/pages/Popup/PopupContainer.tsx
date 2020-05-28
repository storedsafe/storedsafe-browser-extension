import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSearch } from '../../hooks/useSearch';
import { useStorage } from '../../hooks/useStorage';
import * as Popup from '../../components/Popup';

export const PopupContainer: React.FunctionComponent = () => {
  const { state, isInitialized } = useStorage();
  const auth = useAuth();
  const search = useSearch();

  const openOptions = (): void => { browser.runtime.openOptionsPage() };

  return (
    <Popup.Main
      isInitialized={isInitialized}
      search={{
        urls: Object.keys(state.sessions),
        results: state.search,
        ...search,
      }}
      auth={{
        sites: state.sites.list,
        sessions: state.sessions,
        sitePrefs: state.sitePrefs,
        ...auth,
      }}
      openOptions={openOptions}
    />
  );
};
