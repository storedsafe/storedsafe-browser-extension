import React from 'react'
import { SiteOptions, SiteOptionsProps } from './layout/SiteOptions'
import { LoadingComponent, ListView, ListItem } from '../common/layout'
import './Options.scss'
import { GeneralOptions, GeneralOptionsProps } from './layout/GeneralOptions'
import { IgnoreOptions, IgnoreOptionsProps } from './layout/IgnoreOptions'
import { ClearDataOptions, ClearDataOptionsProps } from './layout/ClearDataOptions'

export interface OptionsProps {
  isInitialized: boolean
  generalOptionsProps: GeneralOptionsProps
  siteOptionsProps: SiteOptionsProps
  ignoreOptionsProps: IgnoreOptionsProps
  clearDataProps: ClearDataOptionsProps
}

export const Options: React.FunctionComponent<OptionsProps> = ({
  isInitialized,
  generalOptionsProps,
  siteOptionsProps,
  ignoreOptionsProps,
  clearDataProps
}: OptionsProps) => {
  if (!isInitialized) return <LoadingComponent />

  const items: ListItem[] = [
    {
      key: 'general',
      title: <h2>General Settings</h2>,
      content: <GeneralOptions {...generalOptionsProps} />
    },
    {
      key: 'sites',
      title: <h2>Sites</h2>,
      content: <SiteOptions {...siteOptionsProps} />
    },
    {
      key: 'ignore',
      title: <h2>Ignore List</h2>,
      content: <IgnoreOptions {...ignoreOptionsProps} />
    },
    {
      key: 'clear-data',
      title: <h2>Clear Data</h2>,
      content: <ClearDataOptions {...clearDataProps} />
    }
  ]

  return (
    <section className='options'>
      <h1>Options</h1>
      <ListView items={items} />
    </section>
  )
}
