import React from 'react'
import { Welcome, WelcomeProps } from '../components/Popup/layout/Welcome'
import { useSites } from '../hooks/storage/useSites'
import { SiteOptions, OnAddSiteCallback, OnRemoveSiteCallback } from '../components/Options'

interface WelcomeHookProps {
  addSite: OnAddSiteCallback
  removeSite: OnRemoveSiteCallback
}

const useWelcome = ({
  addSite,
  removeSite
}: WelcomeHookProps): WelcomeProps => {
  const sites = useSites()
  const siteOptions: React.ReactNode = (
    <SiteOptions
      removeSite={removeSite}
      addSite={addSite}
      userSites={sites.user}
      systemSites={sites.system}
    />
  )

  return {
    isInitialized: sites.isInitialized,
    siteOptions
  }
}

const WelcomeContainer: React.FunctionComponent<WelcomeHookProps> = (
  props: WelcomeHookProps
) => {
  const welcomeProps = useWelcome(props)
  return <Welcome {...welcomeProps} />
}

export default WelcomeContainer
