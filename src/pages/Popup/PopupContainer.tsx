/**
 * Entrypoint for Popup. Routes external data to the Popup UI component.
 * */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSearch } from '../../hooks/useSearch';
import { useStorage } from '../../hooks/useStorage';
import * as Popup from '../../components/Popup';

export const PopupContainer: React.FunctionComponent = () => {
  const { state, isInitialized } = useStorage();
  const [addValues, setAddValues] = useState();
  const auth = useAuth();
  const search = useSearch();

  const openOptions = (): void => { browser.runtime.openOptionsPage() };

  useEffect(() => {
    browser.runtime.onMessage.addListener((message) => {
      const { type } = message;
      if (type === 'save') {
        const { data } = message;
        setAddValues(data);
      }
    });
  });

  return (
    <Popup.Main
      add={{
        hosts: [...state.sessions.keys()],
        values: addValues,
      }}
      isInitialized={isInitialized}
      search={{
        hosts: [...state.sessions.keys()],
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
