import React from 'react';
import { useStorage } from '../hooks/useStorage';

const DebugStorage: React.FC = () => {
  const { state, isInitialized } = useStorage();

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
      <p>Is Initialized: {isInitialized.toString()}</p>
      <h3>Settings</h3>
      {settings}
      <h3>System Sites</h3>
      {systemSites}
      <h3>User Sites</h3>
      {userSites}
      <h3>Sessions</h3>
      {sessions}
      <h3>Site Prefs</h3>
      {sitePrefs}
    </section>
  );
};

export default DebugStorage;
