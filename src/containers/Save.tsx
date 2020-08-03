import React, { useState, useEffect, useCallback } from 'react'
import {
  SaveProps,
  SaveCallback,
  TabValues,
  AddToBlacklistCallback,
  Save,
  OnSelectChangeCallback,
  SelectType
} from '../components/Save/Save'
import { useBlacklist } from '../hooks/storage/useBlacklist'
import { useSessions } from '../hooks/storage/useSessions'
import { actions as StoredSafeActions } from '../model/storedsafe/StoredSafe'

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
  const blacklist = useBlacklist()
  const [tabValues, setTabValues] = useState<TabValues>()
  const [success, setSuccess] = useState<boolean>(false)
  const [siteState, setSiteState] = useState<SiteState>()
  const [tabId, setTabId] = useState<number>()

  const isInitialized =
    sessions.isInitialized &&
    blacklist.isInitialized &&
    siteState?.vaults !== undefined &&
    siteState?.templates !== undefined &&
    tabValues !== undefined

  function close () {
    browser.tabs.sendMessage(tabId, { type: 'close' })
  }

  const save: SaveCallback = async (host, values) => {
    await StoredSafeActions.addObject(host, values)
    setSuccess(true)
    setTimeout(close, 1500)
  }

  const addToBlacklist: AddToBlacklistCallback = async host => {
    await blacklist.add(host)
  }

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

  const hosts: SelectType<string> = {
    values: [...sessions.sessions.keys()],
    selected: siteState?.host,
    onChange: hostChange
  }

  const vaults: SelectType<SSVault> = {
    values: siteState?.vaults,
    selected: siteState?.vault,
    onChange: selected =>
      setSiteState(prevState => ({ ...prevState, vault: selected }))
  }

  const templates: SelectType<SSTemplate> = {
    values: siteState?.templates,
    selected: siteState?.template,
    onChange: selected =>
      setSiteState(prevState => ({ ...prevState, template: selected }))
  }

  useEffect(() => {
    if ([...sessions.sessions.keys()].length > 0) {
      hostChange(0)
    }
  }, [sessions.sessions, hostChange])

  browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'save') {
      const { data } = message
      setTabValues(data)
      setTabId(sender.tab.id)
    }
  })

  return {
    isInitialized,
    tabValues,
    hosts,
    vaults,
    templates,
    save,
    addToBlacklist,
    success,
    close
  }
}

const SaveContainer: React.FunctionComponent = () => {
  const SaveProps = useSave()
  return <Save {...SaveProps} />
}

export default SaveContainer
