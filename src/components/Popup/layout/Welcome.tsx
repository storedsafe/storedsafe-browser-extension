import React from 'react'
import './Welcome.scss'
import { LoadingComponent } from '../../common/layout'

export interface WelcomeProps {
  isInitialized: boolean
  siteOptions: React.ReactNode
}

export const Welcome: React.FunctionComponent<WelcomeProps> = ({
  isInitialized,
  siteOptions
}: WelcomeProps) => {
  if (!isInitialized) return <LoadingComponent />
  return (
    <section className='welcome'>
      <article className='welcome-article welcome-message'>
        <h2>Welcome to StoredSafe!</h2>
        <p>
          To use StoredSafe, you need to have access to a StoredSafe server.
        </p>
        <p>
          If you have the information for your StoredSafe server, you can add it
          below. If not, you should ask your administrator to set it up for you.
        </p>
        <p>
          If you are not yet a StoredSafe customer, please visit{' '}
          <a href='https://storedsafe.com/'>storedsafe.com</a> for more
          information.
        </p>
      </article>
      <article className='welcome-article welcome-options'>
        {siteOptions}
      </article>
    </section>
  )
}
