import React from 'react';
import Welcome from '../pages/Welcome';
import Popup from '../pages/Popup';
import Inject from '../pages/Inject';
import './Extension.scss';

export default function Extension(props) {
  let page;
  const path = window.location.href.split('#')[1];

  switch(path) {
    case 'popup':
      page = <Popup />;
      break;
    case 'inject':
      page = <Inject />;
      break;
    default:
      page = <Welcome />;
  }

  return (
    <main>
      {page}
    </main>
  );
}
