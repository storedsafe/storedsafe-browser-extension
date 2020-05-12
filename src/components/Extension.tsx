import React, { useState, useEffect } from 'react';
import { StorageProvider, useStorage } from '../hooks/useStorage';
import DebugStorage from './DebugStorage';
import Options from './Options';
import Popup from './Popup'

enum Page {
  Options = 'options',
    Popup = 'popup',
    Debug = 'debug'
}

const StorageListener: React.FunctionComponent = () => {
  const { dispatch } = useStorage();
  useEffect(() => {
    const onChanged = (): void => {
      dispatch({ type: 'init' });
    };
    browser.storage.onChanged.addListener(onChanged);
    return (): void => {
      browser.storage.onChanged.removeListener(onChanged)
    };
  }, [dispatch]);
  return null;
};

const Extension: React.FunctionComponent = () => {
  const [page, setPage] = useState<Page>();

  React.useEffect(() => {
    const path = window.location.href.split('#')[1];
    switch(path) {
      case Page.Popup: {
        setPage(Page.Popup);
        break;
      }
      case Page.Debug: {
        setPage(Page.Debug);
        break;
      }
      default: {
        setPage(Page.Options);
      }
    }

  }, []);

  return (
    <section className="extension">
      <StorageProvider>
        {page === Page.Options && <Options />}
        {page === Page.Debug && <DebugStorage />}
        {page === Page.Popup && <Popup />}
        <StorageListener />
      </StorageProvider>
    </section>
  );
}

export default Extension;
