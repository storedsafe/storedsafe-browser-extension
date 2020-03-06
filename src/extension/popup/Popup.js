import React, { useState } from 'react';
import LoginContainer from './Login/LoginContainer';
import MainContainer from './Main/MainContainer';

import browser from 'webextension-polyfill';

export default function Popup(props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  browser.tabs.getCurrent().then(tab => {
    console.log(tab);
  }).catch(error => {
    console.error(error.message);
  });

  let page;

  if (!isAuthenticated)
    page = <LoginContainer onLogIn={() => setIsAuthenticated(true)} />;
  else
    page = <MainContainer onLogOut={() => setIsAuthenticated(false)} />;

  return (
    <main>
      {page}
    </main>
  );
};

