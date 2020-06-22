/**
 * Hook for managing data related to the AddObject component.
 * */
import { useState } from 'react';
import { usePromise } from './usePromise';
import { OnAddCallback, AddObjectProperty, OnPropertyChangeCallback } from '../components/Add/AddObject';
import { useStorage } from './useStorage';
import { actions as StoredSafeActions } from '../model/storedsafe/StoredSafe'; 

/**
 * 
 * */
interface AddHook {
  host: AddObjectProperty<string>;
  vault: AddObjectProperty<SSVault>;
  template: AddObjectProperty<SSTemplate>;
  onAdd: OnAddCallback;
}

const useAdd = (): AddHook => {
  const { state } = useStorage();
  const {
    data: siteInfo,
    isLoading: siteLoading,
    error: siteError,
    dispatch: siteDispatch,
  } = usePromise<SSSiteInfo>();

  const hosts = [...state.sessions.keys()]

  const [host, setHost] = useState<number>(0);
  const [vault, setVault] = useState<number>(0);
  const [template, setTemplate] = useState<number>(0);

  const onHostChange: OnPropertyChangeCallback = (id) => {
    const currentHost = hosts[host];
    siteDispatch(StoredSafeActions.getSiteInfo(currentHost));
    setHost(id)
  }

  const onAdd: OnAddCallback = (params) => {
    // TODO: Add to StoredSafe
  }

  return {
    host: {
      selected: host,
      onChange: onHostChange,
      values: state.sites.list.map(({ host }) => host),
    },
    vault: {
      selected: vault,
      onChange: setVault,
      values: [],
    },
    template: {
      selected: template,
      onChange: setTemplate,
      values: [],
    },
    onAdd,
  };
}
