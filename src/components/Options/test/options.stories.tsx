import React, { useState } from 'react'
import { action } from '@storybook/addon-actions'
import {
  SiteOptions,
  OnAddSiteCallback,
  OnRemoveSiteCallback
} from '../layout/SiteOptions'
import {
  GeneralOptions,
  OnSaveSettingsCallback
} from '../layout/GeneralOptions'

export default {
  title: 'Options'
}

/// /////////////////////////////////////////////////////////
// Example data

const systemSites: Site[] = [
  { host: 'managed.example.com', apikey: 'managed_apikey' },
  { host: 'safe.system.com', apikey: 'safe_apikey' }
]

const userSites: Site[] = [
  { host: 'user.example.com', apikey: 'managed_apikey' },
  { host: 'safe.user.com', apikey: 'safe_apikey' }
]

const settings: Settings = new Map([
  ['idleMax', { value: 15, managed: false }],
  ['autoFill', { value: true, managed: false }],
  ['maxTokenLife', { value: 8, managed: true }]
])

/// /////////////////////////////////////////////////////////
// Components

const SiteOptionsComponent: React.FunctionComponent = () => {
  const addSite: OnAddSiteCallback = async site => {
    userSites.push(site)
    await Promise.resolve(action('add')(site))
  }
  const removeSite: OnRemoveSiteCallback = async id => {
    userSites.splice(id, 1)
    await Promise.resolve(action('remove')(id))
  }
  return (
    <article className='story-article'>
      <h2>Site Options</h2>
      <p>
        The Site Options component offers an interface to add/remove available
        sites.
      </p>
      <SiteOptions
        removeSite={removeSite}
        addSite={addSite}
        {...{ systemSites, userSites }}
      />
    </article>
  )
}

const GeneralOptionsComponent: React.FunctionComponent = () => {
  const [options, setOptions] = useState<Settings>(settings)
  const saveSettings: OnSaveSettingsCallback = async newSettings => {
    setOptions(newSettings)
    await Promise.resolve(action('save')(settings))
  }
  return (
    <article className='story-article'>
      <h2>General Options</h2>
      <p>
        The General Options component offers an interface where the user can
        choose how the extension should behave.
      </p>
      <GeneralOptions saveSettings={saveSettings} settings={options} />
    </article>
  )
}

export const Options: React.FunctionComponent = () => {
  return (
    <section className='story-section'>
      <article className='story-article'>
        <h1>Options</h1>
        <p>
          Provides an interface for settings that are available for the user to
          change.
        </p>
        <p>
          Here you can see the Options component broken down into its individual
          components and different states.
        </p>
      </article>
      <SiteOptionsComponent />
      <GeneralOptionsComponent />
    </section>
  )
}
