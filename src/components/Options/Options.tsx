import React from 'react'
import { SiteOptions, SiteOptionsProps } from './layout/SiteOptions'
import { LoadingComponent, ListView, ListItem } from '../common/layout'
import './Options.scss'
import { GeneralOptions, GeneralOptionsProps } from './layout/GeneralOptions'
import { BlacklistOptions, BlacklistOptionsProps } from './layout/BlacklistOptions'

export interface OptionsProps {
  isInitialized: boolean
  generalOptionsProps: GeneralOptionsProps
  siteOptionsProps: SiteOptionsProps
  blacklistOptionsProps: BlacklistOptionsProps
}

export const Options: React.FunctionComponent<OptionsProps> = ({
  isInitialized,
  generalOptionsProps,
  siteOptionsProps,
  blacklistOptionsProps
}: OptionsProps) => {
  if (!isInitialized) return <LoadingComponent />

  const items: ListItem[] = [
    {
      key: 'general',
      title: <h2>General Options</h2>,
      content: <GeneralOptions {...generalOptionsProps} />
    },
    {
      key: 'sites',
      title: <h2>Site Options</h2>,
      content: <SiteOptions {...siteOptionsProps} />
    },
    {
      key: 'blacklist',
      title: <h2>Blacklist options</h2>,
      content: <BlacklistOptions {...blacklistOptionsProps} />
    }
  ]

  return (
    <section className='options'>
      <ListView items={items} />
    </section>
  )
}
