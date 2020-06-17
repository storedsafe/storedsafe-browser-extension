import { useState } from 'react';
import { OnAddCallback, AddObjectProperty, OnPropertyChangeCallback } from '../components/Add/AddObject';
import { useStorage } from './useStorage';

interface AddHook {
  host: AddObjectProperty<string>;
  vault: AddObjectProperty<SSVault>;
  template: AddObjectProperty<SSTemplate>;
  onAdd: OnAddCallback;
}

const useAdd = (): AddHook => {
  const { state } = useStorage();

  const [host, setHost] = useState<number>(0);
  const [vault, setVault] = useState<number>(0);
  const [template, setTemplate] = useState<number>(0);

  const onHostChange: OnPropertyChangeCallback = (id) => {
    // TODO: Fetch vaults and templates
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
