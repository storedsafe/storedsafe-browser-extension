import React, { useState } from 'react';
import logo from '../../assets/logo.png';
import SettingsContainer from './Settings/SettingsContainer';

export default function App(props) {
  const [token, setToken] = useState(null);
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && 'token' in changes)
      setToken(changes[token]);
  });

  return (
    <main className="app">
      <img src={logo} alt="StoredSafe" />
      <SettingsContainer />
      <p>{token}</p>
    </main>
  );
}
