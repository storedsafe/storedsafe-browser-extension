import React from 'react'
import { Button } from '../../common/input'
import { Message } from '../../common/layout'
import './SessionStatus.scss'

export type OnLogoutCallback = (host: string) => void

interface SessionStatusProps {
  host: string
  session: Session
  onLogout: OnLogoutCallback
  goto: (host: string) => void
}

export const SessionStatus: React.FunctionComponent<SessionStatusProps> = ({
  host,
  session,
  onLogout,
  goto
}: SessionStatusProps) => {
  const warningMessages = (
    <article className='session-status-warnings'>
      <h3 className='warnings-title'>Warnings</h3>
      {Object.values(session.warnings).map((warning, index) => (
        <Message key={index} type='warning'>
          {warning}
        </Message>
      ))}
    </article>
  )
  const errorMessages = (
    <article className='session-status-errors'>
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
    <section className='session-status'>
      <article className='session-status-online'>
        <h3>Session status</h3>
        <p className='session-status-active'>
          Online since {dateStamp} ({minutesActive} minutes).
        </p>
      </article>
      {Object.values(session.violations).length > 0 && errorMessages}
      {Object.values(session.warnings).length > 0 && warningMessages}
      <Button type='button' onClick={() => goto(host)}>
        Go to {host}
      </Button>
      <Button type='submit' color='danger' onClick={(): void => onLogout(host)}>
        Logout
      </Button>
    </section>
  )
}
