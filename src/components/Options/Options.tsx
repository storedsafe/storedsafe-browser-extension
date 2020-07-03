import React from 'react'
import { SiteOptions, SiteOptionsProps } from './layout/SiteOptions'
import { LoadingComponent, ListView, ListItem } from '../common/layout'
import './Options.scss'
import { GeneralOptions, GeneralOptionsProps } from './layout/GeneralOptions'

export interface OptionsProps {
  isInitialized: boolean
  siteOptionsProps: SiteOptionsProps
  generalOptionsProps: GeneralOptionsProps
}

export const Options: React.FunctionComponent<OptionsProps> = ({
  isInitialized,
  siteOptionsProps,
  generalOptionsProps
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
    }
  ]

  return (
    <section className='options'>
      <ListView items={items} />
    </section>
  )
}
