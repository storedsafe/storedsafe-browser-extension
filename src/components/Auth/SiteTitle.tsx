import React from 'react'
import { icons } from '../common/layout'
import './SiteTitle.scss'

interface SiteTitleProps {
  host: string
  session?: Session
}

export const SiteTitle: React.FunctionComponent<SiteTitleProps> = ({
  host,
  session
}: SiteTitleProps) => {
  const isOnline = session !== undefined
  return (
    <article className={`site-title${isOnline ? ' online' : ''}`}>
      <p className='site-title-host'>{host}</p>
      <div className='site-title-icons'>
        {isOnline && Object.values(session.warnings).length > 0 && icons.warning}
        {isOnline && Object.values(session.violations).length > 0 && icons.error}
        {isOnline && icons.vault_unlocked}
        {!isOnline && icons.vault_locked}
      </div>
    </article>
  )
}
