import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.scss';

import Extension from './Extension';

/**
 * Launch axe accessibility helper in dev mode.
 * Appears in browser console.
 * */
if (process.env.NODE_ENV !== 'production') {
  /* eslint @typescript-eslint/no-var-requires: off */
  const axe = require('react-axe');
  axe(React, ReactDOM, 1000, {
    rules: [
      {
        id: 'color-contrast',
        selector: '*:not(.button-accent .button-children)',
      },
      {
        id: 'page-has-heading-one',
        selector: '*:not(.popup)',
      }
    ],
  });
}

ReactDOM.render(
  <Extension />,
  document.getElementById('app')
);
