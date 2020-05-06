import React from 'react';
import { useStorage } from '../state/StorageState';
import { CollapseList } from './Layout';

const DebugStorage: React.FC = () => {
  const [state] = useStorage();

  const settings = Object.keys(state.settings).map((key) => {
    const { value, managed } = state.settings[key];
    return (
      <React.Fragment key={key}>
        <strong>{key}: </strong>{value.toString()}<br />
        <strong>Managed: </strong>{managed.toString()}
      </React.Fragment>
    );
  })

  const systemSites = state.sites.collections.system.map((site) => {
    const { url, apikey } = site;
    return (
      <React.Fragment key={url}>
        <strong>URL: </strong>{url}<br />
        <strong>API Key: </strong>{apikey}
      </React.Fragment>
    );
  })

  const userSites = state.sites.collections.user.map((site) => {
    const { url, apikey } = site;
    return (
      <React.Fragment key={url}>
        <strong>URL: </strong>{url}<br />
        <strong>API Key: </strong>{apikey}
      </React.Fragment>
    );
  })

  const sessions = Object.keys(state.sessions).map((url) => {
    const { apikey, token, createdAt } = state.sessions[url];
    return (
      <React.Fragment key={url}>
        <strong>URL: </strong>{url}<br />
        <strong>API Key: </strong>{apikey}<br />
        <strong>Token: </strong>{token}<br />
        <strong>Created At: </strong>{createdAt}
      </React.Fragment>
    );
  });

  const sitePrefs = Object.keys(state.sitePrefs).map((url) => {
    const { username, loginType } = state.sitePrefs[url];
    return (
      <React.Fragment key={url}>
        <strong>Username: </strong>{username}<br />
        <strong>Login Type: </strong>{loginType}<br />
      </React.Fragment>
    );
  });

  return (
    <section className="card">
      <h2>Storage</h2>
      <h3>State</h3>
      <p>Is Initialized: {state.isInitialized.toString()}</p>
      <p>Is Loading: {state.isLoading.toString()}</p>
      <p>Has Error: {state.hasError.toString()}</p>
      <p>Error: {state.error && state.error.toString() || 'none'}</p>
      {true && (
        <React.Fragment>
          <CollapseList startCollapsed={false} title={<h3>Settings</h3>} items={settings} />
          <CollapseList startCollapsed={false} title={<h3>System Sites</h3>} items={systemSites} />
          <CollapseList startCollapsed={false} title={<h3>User Sites</h3>} items={userSites} />
          <CollapseList startCollapsed={false} title={<h3>Sessions</h3>} items={sessions} />
          <CollapseList startCollapsed={false} title={<h3>Site Prefs</h3>} items={sitePrefs} />
        </React.Fragment>
      )}
    </section>
  );
};

export default DebugStorage;
