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

  const isInitialized = sites.isInitialized && settings.isInitialized

  const saveSettings: OnSaveSettingsCallback = async newSettings => {
    await settings.update(newSettings)
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
