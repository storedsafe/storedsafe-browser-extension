import React, { useState } from 'react';
import { StorageProvider } from '../state/StorageState';
import DebugStorage from './DebugStorage';
import Options from './Options';
import Popup from './Popup'

enum Page {
  Options = 'options',
    Popup = 'popup',
    Debug = 'debug',
}

const Extension: React.FunctionComponent = () => {
  const [page, setPage] = useState<Page>(Page.Options);

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
      </StorageProvider>
    </section>
  );
}

export default Extension;
