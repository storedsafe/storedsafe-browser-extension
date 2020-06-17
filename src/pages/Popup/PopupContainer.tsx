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
      add={{
        hosts: [...state.sessions.keys()],
        onHostChange: (host: string): void => { console.log(host) },
      }}
      isInitialized={isInitialized}
      search={{
        hosts: Object.keys(state.sessions),
        results: state.search,
        ...search,
      }}
      auth={{
        sites: state.sites.list,
        sessions: state.sessions,
        preferences: state.preferences,
        ...auth,
      }}
      openOptions={openOptions}
    />
  );
};
