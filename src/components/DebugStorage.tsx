import React from 'react';
import { useStorage } from '../hooks/useStorage';

const DebugStorage: React.FC = () => {
  const { state, isInitialized } = useStorage();

  const settings = Object.keys(state.settings).map((key) => {
    const { value, managed } = state.settings[key];
    return (
      <p key={key}>
        <strong>{key}: </strong>{value.toString()}<br />
        <strong>Managed: </strong>{managed.toString()}
      </p>
    );
  })

  const systemSites = state.sites.collections.system.map((site) => {
    const { url, apikey } = site;
    return (
      <p key={url}>
        <strong>URL: </strong>{url}<br />
        <strong>API Key: </strong>{apikey}
      </p>
    );
  })

  const userSites = state.sites.collections.user.map((site) => {
    const { url, apikey } = site;
    return (
      <p key={url}>
        <strong>URL: </strong>{url}<br />
        <strong>API Key: </strong>{apikey}
      </p>
    );
  })

  const sessions = Object.keys(state.sessions).map((url) => {
    const { apikey, token, createdAt } = state.sessions[url];
    return (
      <p key={url}>
        <strong>URL: </strong>{url}<br />
        <strong>API Key: </strong>{apikey}<br />
        <strong>Token: </strong>{token}<br />
        <strong>Created At: </strong>{createdAt}
      </p>
    );
  });

  const sitePrefs = Object.keys(state.sitePrefs.sites).map((url) => {
    const { username, loginType } = state.sitePrefs.sites[url];
    return (
      <p key={url}>
        <strong>Username: </strong>{username}<br />
        <strong>Login Type: </strong>{loginType}<br />
      </p>
    );
  });

  return (
    <section>
      <h2>Storage</h2>
      <section
        style={{
          display: 'grid',
          gridGap: '8px',
        }}>
        <article>
          <h3>State</h3>
          <p>Is Initialized: {isInitialized.toString()}</p>
        </article>
        <article>
          <h3>Settings</h3>
          {settings}
        </article>
        <article>
          <h3>System Sites</h3>
          {systemSites}
        </article>
        <article>
          <h3>User Sites</h3>
          {userSites}
        </article>
        <article>
          <h3>Sessions</h3>
          {sessions}
        </article>
        <article>
          <h3>Site Prefs</h3>
          <p>Last used: {state.sitePrefs.lastUsed}</p>
          {sitePrefs}
        </article>
      </section>
    </section>
  );
};

export default DebugStorage;
