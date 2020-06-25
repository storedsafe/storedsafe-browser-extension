/**
 * Entrypoint for React, mounts React application in DOM.
 * Sets up development tools that run on UI pages.
 * */
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './index.scss'

import Extension from './containers/Extension'

/**
 * Render extension UI onto page.
 * */
ReactDOM.render(
  <Extension />,
  document.getElementById('app')
)
