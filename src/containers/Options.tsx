import React from 'react'
import {
  Options,
  OptionsProps,
  OnSaveSettingsCallback,
  OnAddSiteCallback,
  OnRemoveSiteCallback
} from '../components/Options'
import { useSites } from '../hooks/storage/useSites'
import { useSettings } from '../hooks/storage/useSettings'
import { useIgnore } from '../hooks/storage/useIgnore'
import { OnClearAll } from '../components/Options/layout/ClearDataOptions'

interface OptionsHookProps {
  addSite: OnAddSiteCallback
  removeSite: OnRemoveSiteCallback
}

const useOptions = ({
  addSite,
  removeSite
}: OptionsHookProps): OptionsProps => {
  const sites = useSites()
  const settings = useSettings()
  const ignore = useIgnore()

  const isInitialized = sites.isInitialized && settings.isInitialized

  const saveSettings: OnSaveSettingsCallback = async newSettings => {
    await settings.update(newSettings)
  }

  const clearAll: OnClearAll = async () => {
    const localPromise = browser.storage.local.clear()
    const syncPromise = browser.storage.sync.clear()
    await localPromise
    await syncPromise
  }

  return {
    isInitialized,
    siteOptionsProps: {
      addSite,
      removeSite,
      systemSites: sites.system,
      userSites: sites.user
    },
    generalOptionsProps: {
      saveSettings,
      settings: settings.settings
    },
    ignoreOptionsProps: {
      removeIgnoreHost: ignore.remove,
      ignore: ignore.ignore
    },
    clearDataProps: {
      clearAll
    }
  }
}

const OptionsContainer: React.FunctionComponent<OptionsHookProps> = (
  props: OptionsHookProps
) => {
  const optionsProps = useOptions(props)
  return <Options {...optionsProps} />
}

export default OptionsContainer
