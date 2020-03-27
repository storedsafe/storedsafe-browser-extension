import React from 'react';
import Settings from '../../pages/Settings';
import Popup from '../../pages/Popup';

export default function Extension() {
  let page;
  const path = window.location.href.split('#')[1];

  switch (path) {
    case 'popup':
      page = <Popup />;
      break;
    default:
      page = <Settings />;
  }

  return (
    <main className="extension">
      {page}
    </main>
  );
}
