import React, { useState, useEffect, useCallback } from 'react'
import { FillProps, FillCallback, Fill } from '../components/Fill/Fill'
import { useIgnore } from '../hooks/storage/useIgnore'
import { useSessions } from '../hooks/storage/useSessions'
import {
  FLOW_FILL,
  ACTION_POPULATE,
  ACTION_CLOSE,
  ACTION_RESIZE,
  PORT_FILL_CLOSE,
  PORT_FILL_CONNECTED,
  PORT_FILL_RESIZE,
  PORT_FILL_FILL,
  ACTION_FILL
} from '../scripts/content_script/messages/constants'
import Logger from '../utils/Logger'

const iframeLogger = new Logger('iframe')
const logger = new Logger('fill', iframeLogger)

const useFill = (): FillProps => {
  const sessions = useSessions()
  const ignore = useIgnore()
  const [results, setResults] = useState<SSObject[]>()

  const isInitialized =
    sessions.isInitialized && ignore.isInitialized && results !== undefined

  /**
   * Open a port to the background script.
   */
  function getPort (name: string): browser.runtime.Port {
    return browser.runtime.connect(browser.runtime.id, { name })
  }

  /**
   * Send message to close the injected frame.
   */
  function close () {
    const port = getPort(PORT_FILL_CLOSE)
    port.postMessage({ type: `${FLOW_FILL}.${ACTION_CLOSE}` })
  }

  /**
   * Fill the object on the page.
   * @param result The object to use for fill
   */
  const fill: FillCallback = async (result: SSObject) => {
    const port = getPort(PORT_FILL_FILL)
    port.postMessage({
      type: `${FLOW_FILL}.${ACTION_FILL}`,
      data: result
    })
    close()
  }

  // Set up a connection to the background script when this component finishes loading
  useEffect(() => {
    let mounted = true
    /**
     * Populate the component when a fill.populate message is recieved from
     * the background script.
     * @param message Message from background script.
     */
    function onMessage ({ type, data }: Message) {
      const [flow, action] = type.split('.')
      if (flow === FLOW_FILL && action === ACTION_POPULATE) {
        if (mounted) {
          setResults(data as SSObject[])
        }
      }
    }

    // Start listening to messages from the background script
    const port = getPort(PORT_FILL_CONNECTED)
    port.onMessage.addListener(onMessage)

    // Clean up connections when the component dismounts
    return () => {
      port.onMessage.removeListener(onMessage)
      port.disconnect()
    }
  }, [])

  function resize (width: number, height: number): void {
    const port = getPort(PORT_FILL_RESIZE)
    port.postMessage({
      type: `${FLOW_FILL}.${ACTION_RESIZE}`,
      data: { width, height }
    })
  }

  return {
    isInitialized,
    fill,
    results,
    close,
    resize
  }
}

const FillContainer: React.FunctionComponent = () => {
  const FillProps = useFill()
  return <Fill {...FillProps} />
}

export default FillContainer
