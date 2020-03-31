import React, { useState } from 'react';
import Header from '../../components/Header';
import Auth from '../../containers/Auth';
import ObjectList from '../../containers/ObjectList';

export default function Popup() {
  const [isAuthenticated, setAuthenticated] = useState(false);

  return (
    <div className="popup">
      <Header />
      {isAuthenticated && <ObjectList /> }
      <Auth setAuthenticated={(isAuth) => setAuthenticated(isAuth)} />
    </div>
  );
}
