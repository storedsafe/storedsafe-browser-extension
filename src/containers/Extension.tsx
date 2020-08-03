/**
 * Entrypoint for the extension UI.
 * Performs routings based on the browser URL.
 * */
import React, { useState } from 'react'
import DebugStorage from './DebugStorage'
import Popup from './Popup'
import Save from './Save'

enum Page {
  Popup = 'popup',
  Debug = 'debug',
  Save = 'save',
  Toggle = 'toggle',
}

/**
 * @returns Extension UI.
 * */
const Extension: React.FunctionComponent = () => {
  const [page, setPage] = useState<Page>()

  // Once the component is loaded, set the page based on the URL.
  // Defaults to Options page.
  React.useEffect(() => {
    const path = window.location.href.split('#')[1]
    switch (path) {
      case Page.Popup: {
        setPage(Page.Popup)
        break
      }
      case Page.Debug: {
        setPage(Page.Debug)
        break
      }
      case Page.Save: {
        setPage(Page.Save)
        break
      }
      case Page.Toggle: {
        setPage(Page.Toggle)
        break
      }
      default: {
        setPage(Page.Popup)
      }
    }
  }, [])

  const toggle = () => {
    browser.runtime.sendMessage({ type: 'toggle' })
  }
  return (
    <section className='extension'>
      {page === Page.Debug && <DebugStorage />}
      {page === Page.Popup && <Popup />}
      {page === Page.Save && <Save />}
      {page === Page.Toggle && <button onClick={toggle}>Toggle</button>}
    </section>
  )
}

export default Extension
