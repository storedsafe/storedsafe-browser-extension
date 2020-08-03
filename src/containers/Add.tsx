import React, { useState, useEffect, useCallback } from 'react'
import {
  AddProps,
  AddObjectCallback,
  Add,
  OnSelectChangeCallback,
  SelectType
} from '../components/Add/Add'
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

const useAdd = (): AddProps => {
  const sessions = useSessions()
  const [success, setSuccess] = useState<boolean>(false)
  const [siteState, setSiteState] = useState<SiteState>()

  const isInitialized =
    sessions.isInitialized &&
    siteState?.vaults !== undefined &&
    siteState?.templates !== undefined

  const addObject: AddObjectCallback = async (host, values) => {
    await StoredSafeActions.addObject(host, values)
    setSuccess(true)
  }

  const hostChange: OnSelectChangeCallback = useCallback(
    selected => {
      const host = [...sessions.sessions.keys()][selected]
      setSiteState({ host: selected })
      StoredSafeActions.getSiteInfo(host)
        .then(({ vaults, templates }) => {
          vaults = vaults.filter(({ canWrite }) => canWrite)
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

  function clearSuccess (): void {
    setSuccess(false)
  }

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

  return {
    isInitialized,
    addObjectProps: {
      hosts,
      vaults,
      templates,
      addObject,
    },
    success,
    clearSuccess
  }
}

const AddContainer: React.FunctionComponent = () => {
  const addProps = useAdd()
  return <Add {...addProps} />
}

export default AddContainer
