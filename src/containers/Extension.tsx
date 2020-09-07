/**
 * Entrypoint for the extension UI.
 * Performs routings based on the browser URL.
 * */
import React, { useState, useEffect } from 'react'
import DebugStorage from './DebugStorage'
import Popup from './Popup'
import Save from './Save'
import Fill from './Fill'
import { SAVE_FRAME_ID, FILL_FRAME_ID } from '../scripts/content_script/messages/constants'

enum Page {
  Popup = 'popup',
  Debug = 'debug',
  Save = 'save',
  Fill = 'fill'
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
      case Page.Debug: {
        setPage(Page.Debug)
        break
      }
      case SAVE_FRAME_ID: {
        setPage(Page.Save)
        break
      }
      case FILL_FRAME_ID: {
        setPage(Page.Fill)
        break
      }
      default: {
        setPage(Page.Popup)
      }
    }
  }, [])

  return (
    <section className='extension'>
      {page === Page.Debug && <DebugStorage />}
      {page === Page.Popup && <Popup />}
      {page === Page.Save && <Save />}
      {page === Page.Fill && <Fill />}
    </section>
  )
}

export default Extension
