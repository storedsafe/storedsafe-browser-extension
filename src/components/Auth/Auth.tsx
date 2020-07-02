import React from 'react'
import { ListView, ListItem, LoadingComponent } from '../common/layout'
import { SiteTitle } from './SiteTitle'
import './Auth.scss'
import { OnLoginCallback, Login } from './login/Login'
import { OnLogoutCallback, SessionStatus } from './sessionStatus/SessionStatus'

export interface AuthProps {
  isInitialized: boolean
  sites: Site[]
  sessions: Sessions
  login: OnLoginCallback
  logout: OnLogoutCallback
  goto: (host: string) => void
  lastUsedSite: string | undefined
  sitePreferences: { [host: string]: SitePreferences }
}

export const Auth: React.FunctionComponent<AuthProps> = ({
  isInitialized,
  sites,
  sessions,
  login,
  logout,
  goto,
  lastUsedSite,
  sitePreferences
}: AuthProps) => {
  if (!isInitialized) return <LoadingComponent />

  const items: ListItem[] = sites.map(site => {
    const isOnline = sessions.has(site.host)
    return {
      title: (
        <article>
          <SiteTitle
            host={site.host}
            session={isOnline ? sessions.get(site.host) : undefined}
          />
        </article>
      ),
      content: isOnline ? (
        <SessionStatus
          host={site.host}
          session={sessions.get(site.host)}
          onLogout={logout}
          goto={goto}
        />
      ) : (
        <Login
          site={site}
          onLogin={login}
          sitePreferences={sitePreferences[site.host]}
        />
      ),
      key: site.host
    }
  })

  const defaultSelected =
    lastUsedSite !== undefined
      ? lastUsedSite
      : sites.length === 1
        ? sites[0].host
        : undefined

  return (
    <section className='auth'>
      <ListView items={items} defaultSelected={defaultSelected} />
    </section>
  )
}
