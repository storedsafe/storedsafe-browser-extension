import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.scss';

import App from './App';

/**
 * Launch axe accessibility helper in dev mode.
 * Appears in browser console.
 * */
if (process.env.NODE_ENV !== 'production') {
  /* eslint @typescript-eslint/no-var-requires: off */
  const axe = require('react-axe');
  axe(React, ReactDOM, 1000);
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
