import React, { useState, useEffect, useCallback } from 'react'
import {
  SaveProps,
  SaveCallback,
  AddToIgnoreCallback,
  Save,
  OnSelectChangeCallback,
  SelectType
} from '../components/Save/Save'
import { useIgnore } from '../hooks/storage/useIgnore'
import { useSessions } from '../hooks/storage/useSessions'
import { actions as StoredSafeActions } from '../model/storedsafe/StoredSafe'
import {
  PORT_SAVE,
  FLOW_SAVE,
  ACTION_POPULATE,
  ACTION_CLOSE,
  ACTION_RESIZE
} from '../scripts/content_script/messages/constants'
import Logger from '../utils/Logger'

const iframeLogger = new Logger('iframe')
const logger = new Logger('save', iframeLogger)

interface SiteState {
  vaults?: SSVault[]
  templates?: SSTemplate[]
  host: number
  template?: number
  vault?: number
  error?: Error
}

const useSave = (): SaveProps => {
  const sessions = useSessions()
  const ignore = useIgnore()
  const [saveValues, setSaveValues] = useState<SaveValues>()
  const [success, setSuccess] = useState<boolean>(false)
  const [siteState, setSiteState] = useState<SiteState>()

  const isInitialized =
    sessions.isInitialized &&
    ignore.isInitialized &&
    siteState?.vaults !== undefined &&
    siteState?.templates !== undefined &&
    saveValues !== undefined

  /**
   * Open a port to the background script.
   */
  function getPort (): browser.runtime.Port {
    return browser.runtime.connect(browser.runtime.id, {
      name: PORT_SAVE
    })
  }

  /**
   * Send message to close the injected frame.
   */
  function close () {
    const port = getPort()
    port.postMessage({ type: `${FLOW_SAVE}.${ACTION_CLOSE}` })
  }

  /**
   * Save the object to StoredSafe.
   * @param host StoredSafe host to add object to.
   * @param values The fields of the new object.
   */
  const save: SaveCallback = async (host, values) => {
    await StoredSafeActions.addObject(host, values)
    setSuccess(true)
    setTimeout(close, 1500)
  }

  /**
   * Add a site to the ignore so that the plugin will not suggest saving
   * logins from this page in the future.
   * @param host The website to be ignored.
   */
  const addToIgnore: AddToIgnoreCallback = async host => {
    await ignore.add(host)
  }

  /**
   * When the user selects a new host, fetch the vaults and templates for that host.
   */
  const hostChange: OnSelectChangeCallback = useCallback(
    selected => {
      const host = [...sessions.sessions.keys()][selected]
      setSiteState({ host: selected })
      StoredSafeActions.getSiteInfo(host)
        .then(({ vaults, templates }) => {
          vaults = vaults.filter(({ canWrite }) => canWrite)
          // TODO: Decide if other templates should be allowed.
          templates = templates.filter(({ id }) => id === '20')
          const vault = vaults.length > 0 ? 0 : undefined
          const loginTemplateId = templates.findIndex(({ id }) => id === '20')
          const template =
            templates.length > 0
              ? loginTemplateId !== -1
                ? loginTemplateId
                : 0
              : undefined
          setSiteState({ host: selected, vaults, templates, vault, template })
        })
        .catch(error => {
          setSiteState({ host: selected, error })
        })
    },
    [sessions.sessions]
  )

  // Set up the required elements for selecting a host in the UI
  const hosts: SelectType<string> = {
    values: [...sessions.sessions.keys()],
    selected: siteState?.host,
    onChange: hostChange
  }

  // Set up the required elements for selecting a vault in the UI
  const vaults: SelectType<SSVault> = {
    values: siteState?.vaults,
    selected: siteState?.vault,
    onChange: selected =>
      setSiteState(prevState => ({ ...prevState, vault: selected }))
  }

  // Set up the required elements for selecting a template in the UI
  const templates: SelectType<SSTemplate> = {
    values: siteState?.templates,
    selected: siteState?.template,
    onChange: selected =>
      setSiteState(prevState => ({ ...prevState, template: selected }))
  }

  // Reset the chosen host when the list of sessions changes (login/logout/timeout)
  useEffect(() => {
    if ([...sessions.sessions.keys()].length > 0) {
      hostChange(0)
    }
  }, [sessions.sessions, hostChange])

  // Set up a connection to the background script when this component finishes loading
  useEffect(() => {
    let mounted = true
    /**
     * Populate the component when a save.populate message is recieved from
     * the background script.
     * @param message Message from background script.
     */
    function onMessage ({ type, data }: Message) {
      const [flow, action] = type.split('.')
      if (flow === FLOW_SAVE && action === ACTION_POPULATE) {
        if (mounted) {
          setSaveValues(data as SaveValues)
        }
      }
    }

    // Start listening to messages from the background script
    const port = getPort()
    port.onMessage.addListener(onMessage)

    // Clean up connections when the component dismounts
    return () => {
      port.onMessage.removeListener(onMessage)
      port.disconnect()
    }
  }, [])

  function resize (width: number, height: number): void {
    const port = getPort()
    port.postMessage({
      type: `${FLOW_SAVE}.${ACTION_RESIZE}`,
      data: { width, height }
    })
  }

  return {
    isInitialized,
    saveValues,
    hosts,
    vaults,
    templates,
    save,
    addToIgnore,
    success,
    close,
    resize
  }
}

const SaveContainer: React.FunctionComponent = () => {
  const SaveProps = useSave()
  return <Save {...SaveProps} />
}

export default SaveContainer
