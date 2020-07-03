import React, { useState, useEffect, useCallback } from 'react'
import {
  AddProps,
  AddObjectCallback,
  TabValues,
  AddToBlacklistCallback,
  Add,
  OnSelectChangeCallback,
  SelectType
} from '../components/Add/Add'
import { useBlacklist } from '../hooks/storage/useBlacklist'
import { useSessions } from '../hooks/storage/useSessions'
import { actions as StoredSafeActions } from '../model/storedsafe/StoredSafe'

interface AddHookProps {
  tabValues?: TabValues
  clearTabValues: () => void
}

interface SiteState {
  vaults?: SSVault[]
  templates?: SSTemplate[]
  host: number
  template?: number
  vault?: number
  error?: Error
}

const useAdd = ({ tabValues, clearTabValues }: AddHookProps): AddProps => {
  const sessions = useSessions()
  const blacklist = useBlacklist()
  const [success, setSuccess] = useState<boolean>(false)
  const [siteState, setSiteState] = useState<SiteState>()

  const isInitialized =
    sessions.isInitialized &&
    blacklist.isInitialized &&
    siteState?.vaults !== undefined &&
    siteState?.templates !== undefined

  const addObject: AddObjectCallback = async (host, values) => {
    await StoredSafeActions.addObject(host, values)
    setSuccess(true)
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
    if (tabValues !== undefined) clearTabValues()
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
      tabValues,
      hosts,
      vaults,
      templates,
      addObject,
      addToBlacklist
    },
    success,
    clearSuccess
  }
}

const AddContainer: React.FunctionComponent<AddHookProps> = (
  props: AddHookProps
) => {
  const addProps = useAdd(props)
  return <Add {...addProps} />
}

export default AddContainer
