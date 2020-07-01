/**
 * Entrypoint for the extension UI.
 * Performs routings based on the browser URL.
 * */
import React, { useState } from 'react'
import DebugStorage from './DebugStorage'
// import Options from './Options'
import Popup from './Popup'

enum Page {
  Options = 'options',
  Popup = 'popup',
  Debug = 'debug'
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
      default: {
        setPage(Page.Options)
      }
    }
  }, [])

  return (
    <section className='extension'>
      {page === Page.Debug && <DebugStorage />}
      {page === Page.Popup && <Popup />}
      {/* {page === Page.Options && <Options />} */}
    </section>
  )
}

export default Extension
