import React from 'react';
import ReactDOM from 'react-dom';
import Extension from './containers/Extension';
import './index.scss';

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line
  const axe = require('react-axe');
  axe(React, ReactDOM, 1000);
}

ReactDOM.render(
  <Extension />,
  document.getElementById('root'),
);
