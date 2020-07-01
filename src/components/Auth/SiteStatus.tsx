import React from 'react'
import { Button } from '../common/input'
import { Message } from '../common/layout'
import './SiteStatus.scss'

export type OnLogoutCallback = (host: string) => void

interface SiteStatusProps {
  host: string
  session: Session
  onLogout: OnLogoutCallback
}

export const SiteStatus: React.FunctionComponent<SiteStatusProps> = ({
  host,
  session,
  onLogout
}: SiteStatusProps) => {
  const warningMessages = (
    <article className='site-status-warnings'>
      <h3 className='warnings-title'>Warnings</h3>
      {Object.values(session.warnings).map((warning, index) => (
        <Message key={index} type='warning'>
          {warning}
        </Message>
      ))}
    </article>
  )
  const errorMessages = (
    <article className='site-status-errors'>
      <h3 className='errors-title'>Violations</h3>
      {Object.values(session.violations).map((error, index) => (
        <Message key={index} type='error'>
          {error}
        </Message>
      ))}
    </article>
  )

  const minutesActive = Math.floor(
    (Date.now() - session.createdAt) / (1000 * 60)
  )
  const dateStamp = new Date(session.createdAt).toLocaleTimeString('sv')

  return (
    <section className='site-status'>
      <section className='site-status-info'>
        <article className='site-status-online'>
          <h3>Session status</h3>
          <p className='site-status-active'>
            Online since {dateStamp} ({minutesActive} minutes).
          </p>
        </article>
        {Object.values(session.violations).length > 0 && errorMessages}
        {Object.values(session.warnings).length > 0 && warningMessages}
      </section>
      <section className='site-status-logout'>
        {/* <Button
          type="button"
          onClick={(): void => {
            browser.tabs.query({ url: `*://${host}/*` }).then((tabs) => {
              if (tabs.length === 0) {
                return browser.tabs.create({ url: `https://${host}/` })
              }
              let selectedTab = tabs[0];
              for (const tab of tabs) {
                if (tab.lastAccessed > selectedTab.lastAccessed) {
                  selectedTab = tab;
                }
              }
              browser.tabs.update(selectedTab.id, { active: true });
              browser.windows.update(selectedTab.windowId, { focused: true });
            });
          }}>
          Go to {host}
        </Button> */}
        <Button
          type='submit'
          color='danger'
          onClick={(): void => onLogout(host)}
        >
          Logout
        </Button>
      </section>
    </section>
  )
}
