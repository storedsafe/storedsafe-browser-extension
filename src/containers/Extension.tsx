/**
 * Entrypoint for the extension UI.
 * Performs routings based on the browser URL.
 * */
import React, { useState, useEffect } from 'react'
import DebugStorage from './DebugStorage'
import Popup from './Popup'
import Save from './Save'
import { SAVE_FRAME_ID } from '../scripts/content_script/messages'

enum Page {
  Popup = 'popup',
  Debug = 'debug',
  Save = 'save'
}

const MessageCatcher: React.FunctionComponent = () => {
  const [message, setMessage] = useState<string>()

  browser.runtime.onMessage.addListener(message => {
    setMessage(message.type)
  })

  useEffect(() => {
    const port = browser.runtime.connect()
    port.postMessage({ message: 'SAVE CONNECTED' })
    port.onMessage.addListener(({ message }: { message: string }) => {
      setMessage(message)
    })
  }, [])

  return <p>Message: {message}</p>
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
      {/* {page === Page.Save && <MessageCatcher />} */}
    </section>
  )
}

export default Extension
