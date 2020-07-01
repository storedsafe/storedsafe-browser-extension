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

const useAuth = (): AuthProps => {
  const sites = useSites()
  const sessions = useSessions()

  const isInitialized = sites.isInitialized && sessions.isInitialized

  const login: OnLoginCallback = async (site, fields) => {
    // TODO: Update preferences
    await StoredSafeActions.login(site, fields)
  }

  const logout: OnLogoutCallback = async host => {
    await StoredSafeActions.logout(host)
  }

  return {
    isInitialized,
    sites: sites.all,
    sessions: sessions.sessions,
    login,
    logout
  }
}

const AuthContainer: React.FunctionComponent = () => {
  const authProps = useAuth()

  return <Auth {...authProps} />
}

export default AuthContainer
