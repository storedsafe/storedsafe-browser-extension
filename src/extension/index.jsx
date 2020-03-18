import React from 'react';
import ReactDOM from 'react-dom';
import Extension from './containers/Extension';

if (process.env.NODE_ENV !== 'production') {
  const axe = require('react-axe');
  axe(React, ReactDOM, 1000);
}

ReactDOM.render(
  <Extension />,
  document.getElementById('root'),
);
