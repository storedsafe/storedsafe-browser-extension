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
import { useBlacklist } from '../hooks/storage/useBlacklist'

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
  const blacklist = useBlacklist()

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
    },
    blacklistOptionsProps: {
      removeBlacklistHost: blacklist.remove,
      blacklist: blacklist.blacklist
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
