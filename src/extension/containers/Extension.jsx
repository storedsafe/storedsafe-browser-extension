import React from 'react';
import Welcome from '../pages/Welcome';
import Popup from '../pages/Popup';
import './Extension.scss';

export default function Extension() {
  let page;
  const path = window.location.href.split('#')[1];

  switch (path) {
    case 'popup':
      page = <Popup />;
      break;
    default:
      page = <Welcome />;
  }

  return (
    <main className="extension">
      {page}
    </main>
  );
}
