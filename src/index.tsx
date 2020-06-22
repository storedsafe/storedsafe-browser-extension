/**
 * Entrypoint for React, mounts React application in DOM.
 * Sets up development tools that run on UI pages.
 * */
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
        // Accept color contrast of buttons
        id: 'color-contrast',
        selector: '*:not(.button .button-children)',
      },
      {
        // Accept that popup has no header
        id: 'page-has-heading-one',
        selector: '*:not(.popup)',
      },
    ],
  });
}

/**
 * Render extension UI onto page.
 * */
ReactDOM.render(
  <Extension />,
  document.getElementById('app')
);
