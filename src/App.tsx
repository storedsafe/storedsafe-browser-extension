import React, { useState } from 'react';
import Welcome from './components/Welcome';
import Popup from './components/Popup';
import DebugStorage from './components/DebugStorage';
import { Card } from './components/Layout';
import { StorageProvider } from './state/StorageState';

enum Page {
  Welcome = 'welcome',
    Popup = 'popup',
    Test = 'test'
}

const App: React.FC = () => {
  const [page, setPage] = useState<Page>(Page.Welcome);

  React.useEffect(() => {
    const path = window.location.href.split('#')[1];
    switch(path) {
      case Page.Popup: {
        setPage(Page.Popup);
        break;
      }
      case Page.Test: {
        setPage(Page.Test);
        break;
      }
      default: {
        setPage(Page.Welcome);
      }
    }

  }, []);
  const baseUrl = window.location.href.split('#')[0]
  const locationCard = (
    <Card>
      <h2>Location</h2>
      <p><strong>Location: </strong>{page}</p>
      <button onClick={(): void => { window.location.href=`${baseUrl}#welcome`; window.location.reload(false); }}>Welcome</button>
      <button onClick={(): void => { window.location.href=`${baseUrl}#popup`; window.location.reload(false); }}>Popup</button>
      <button onClick={(): void => { window.location.href=`${baseUrl}#test`; window.location.reload(false); }}>Test</button>
    </Card>
  );
  return (
    <section style={page === Page.Popup ? { width: '400px' } : {}}>
      <h1>StoredSafe</h1>
      {/*locationCard*/}
      <StorageProvider>
        {page === Page.Test && <DebugStorage />}
        {page === Page.Popup && <Popup />}
        {page === Page.Welcome && <Welcome />}
      </StorageProvider>
    </section>
  );
}

export default App;
