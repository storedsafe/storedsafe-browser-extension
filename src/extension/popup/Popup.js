import React, { useState, useEffect } from 'react';
import LoginContainer from './Login/LoginContainer';
import MainContainer from './Main/MainContainer';
import config from '../../../config';

import browser from 'webextension-polyfill';

export default function Popup(props) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    browser.storage.local.get('token')
      .then(values => {
        if (values['token'] !== undefined)
          setToken(values['token'])
      });
  }, []);

  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes['token'] !== undefined)
      setToken(changes['token']);
  });

  let page;

  if (token === null) {
    page = <LoginContainer
      onLogIn={(token) => setToken(token)}
    />;
  } else {
    page = <MainContainer
      onLogOut={() => setToken(null)}
    />;
  }

  const [site, setSite] = useState(site);
  browser.storage.local.get('site')
    .then(values => setSite(values['site']));

  return (
    <main className="popup">
      <p>{site}</p>
      <p>{token}</p>
      {page}
      <button onClick={() => { browser.tabs.create({ url: 'https://d1.storedsafe.com/' }); }}>Settings</button>
    </main>
  );
};

