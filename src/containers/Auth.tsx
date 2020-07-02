import React from 'react'
import { useSessions } from '../hooks/storage/useSessions'
import { useSites } from '../hooks/storage/useSites'
import {
  OnLoginCallback,
  OnLogoutCallback,
  AuthProps,
  Auth
} from '../components/Auth'
import { actions as StoredSafeActions } from '../model/storedsafe/StoredSafe'
import { usePreferences } from '../hooks/storage/usePreferences'

interface AuthHookProps {
  goto: (host: string) => void
}

const useAuth = ({ goto }: AuthHookProps): AuthProps => {
  const sites = useSites()
  const sessions = useSessions()
  const preferences = usePreferences()

  const isInitialized = sites.isInitialized && sessions.isInitialized

  const login: OnLoginCallback = async (site, fields) => {
    await StoredSafeActions.login(site, fields)
    // Update preferences after successful login
    await preferences.setLastUsedSite(site.host)
    await preferences.updateSitePreferences(site.host, {
      username: fields.remember ? fields.username : undefined,
      loginType: fields.loginType
    })
  }

  const logout: OnLogoutCallback = async host => {
    await StoredSafeActions.logout(host)
  }

  return {
    isInitialized,
    sites: sites.all,
    sessions: sessions.sessions,
    login,
    logout,
    goto,
    lastUsedSite: preferences.lastUsedSite,
    sitePreferences: preferences.sites
  }
}

const AuthContainer: React.FunctionComponent<AuthHookProps> = ({
  goto
}: AuthHookProps) => {
  const authProps = useAuth({ goto })

  return <Auth {...authProps} />
}

export default AuthContainer
