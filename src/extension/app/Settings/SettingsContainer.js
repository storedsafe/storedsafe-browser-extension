import React, { useState, useEffect } from 'react';
import Settings from './Settings';
import fields from './SettingsFields';

const StorageState = Object.freeze({
  UNKNOWN: 0,
  LOADING: 1,
  ERROR: 2,
  FINISHED: 3,
});

export default function SettingsContainer(props) {
  const [localState, setLocalState] = useState(StorageState.UNKNOWN);
  const [syncState, setSyncState] = useState(StorageState.UNKNOWN);
  const [managedState, setManagedState] = useState(StorageState.UNKNOWN);

  const onValueChange = (event) => {
    const key = event.target.id;
    const value = event.target.value;
    const field = fields.find(field => field.key === key);
    if (field.managed !== true) {
      if (field.sync === true)
        browser.storage.sync.set({ [key]: value })
          .catch(err => console.error(err));
      else
        browser.storage.local.set({ [key]: value })
          .catch(err => console.error(err));
    }
  }

  const assignStoredValues = values => {
    Object.keys(values).forEach(key => {
      const value = values[key];
      const field = fields.find(field => field.key === key)
      if (field.managed !== true) {
        field.attr.defaultValue = value;
      }
    });
  };

  const fetchFields = (storage, filterFunction, storageCallback) => {
    const storageFields = fields.filter(filterFunction).map(field => field.key);
    storage.get(storageFields)
      .then(values => {
        assignStoredValues(values);
        storageCallback(StorageState.FINISHED, values);
      })
      .catch(error => {
        console.error(error);
        storageCallback(StorageState.ERROR);
      });
  }

  if (syncState === StorageState.UNKNOWN) {
    setSyncState(StorageState.LOADING);
    fetchFields(
      browser.storage.sync,
      field => field.sync === true,
      (state, values) => setSyncState(state)
    );
  }

  if (localState === StorageState.UNKNOWN) {
    setLocalState(StorageState.LOADING);
    fetchFields(
      browser.storage.local,
      field => field.sync !== true,
      (state, values) => setLocalState(state)
    );
  }

  if (managedState === StorageState.UNKNOWN) {
    setManagedState(StorageState.LOADING);
    fetchFields(
      browser.storage.managed,
      field => true,
      (state, values) => {
        if (state !== StorageState.error)
          Object.keys(values).forEach(field => field.managed = true);
        setManagedState(state)
      }
    );
  }

  const getStateText = storageState => {
    switch(storageState) {
      case StorageState.UNKNOWN:
      case StorageState.LOADING:
        return "loading";
      case StorageState.FINISHED:
        return "finished";
      case StorageState.ERROR:
        return "error";
    }
  }

  const finishedLoading =
    localState === StorageState.FINISHED &&
    syncState === StorageState.FINISHED &&
    managedState === StorageState.FINISHED;

  return (
    <section>
      <p>Local: {getStateText(localState)} </p>
      <p>Sync: {getStateText(syncState)} </p>
      <p>Managed: {getStateText(managedState)} </p>
      {finishedLoading &&
      <Settings fields={fields} onValueChange={onValueChange} />
      }
    </section>
  );
}
