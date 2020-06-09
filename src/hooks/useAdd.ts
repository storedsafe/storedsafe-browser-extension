import { useState } from 'react';
import { OnAddCallback, AddObjectProperty, OnPropertyChangeCallback } from '../components/Add/AddObject';
import { Vault, Template } from '../model/StoredSafe';
import { useStorage } from './useStorage';

interface AddHook {
  url: AddObjectProperty<string>;
  vault: AddObjectProperty<Vault>;
  template: AddObjectProperty<Template>;
  onAdd: OnAddCallback;
}

const useAdd = (): AddHook => {
  const { state } = useStorage();

  const [url, setUrl] = useState<number>(0);
  const [vault, setVault] = useState<number>(0);
  const [template, setTemplate] = useState<number>(0);

  const onUrlChange: OnPropertyChangeCallback = (id) => {
    // TODO: Fetch vaults and templates
    setUrl(id)
  }

  const onAdd: OnAddCallback = (params) => {
    // TODO: Add to StoredSafe
  }

  return {
    url: {
      selected: url,
      onChange: onUrlChange,
      values: state.sites.list.map(({ url }) => url),
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