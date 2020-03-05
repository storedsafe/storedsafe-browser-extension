import React, { useState } from 'react';
import LoginContainer from './containers/LoginContainer';
import MainContainer from './containers/MainContainer';

export default function Popup(props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  let page;

  if (!isAuthenticated)
    page = <LoginContainer onLogIn={() => setIsAuthenticated(true)} />;
  else
    page = <MainContainer onLogOut={() => setIsAuthenticated(false)} />;

  return page;
};

