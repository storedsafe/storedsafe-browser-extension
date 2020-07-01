import React, { useState } from 'react'
import { action } from '@storybook/addon-actions'

import { TopMenu } from '../layout/TopMenu'
import { MenuItem } from '../../common/layout/Menu'
import { SearchBar, OnNeedleChangeCallback, OnSearchCallback } from '../../common/input/SearchBar'

export default {
  title: 'Popup'
}

/// /////////////////////////////////////////////////////////
// Example data

const menuItems: MenuItem[] = [
  {
    title: 'Item 1',
    icon: (
      <svg
        width='40'
        height='40'
        version='1.1'
        viewBox='0 0 10.583 10.583'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          transform='scale(.26458)'
          d='m5.2637 0c-2.9158 5.9212e-16-5.2637 2.288-5.2637 5.1309v28.738c5.9212e-16 2.8429 2.3479 5.1309 5.2637 5.1309h-.26367v1h3v-1h24v1h3v-1h-.26367c2.9158 0 5.2637-2.288 5.2637-5.1309v-28.738c0-2.8429-2.3479-5.1309-5.2637-5.1309h-29.473zm1.2812 1.6973h26.91c2.662 0 4.8047 2.0901 4.8047 4.6855v26.234c0 2.5955-2.1427 4.6855-4.8047 4.6855h-26.91c-2.662 0-4.8047-2.0901-4.8047-4.6855v-26.234c0-2.5955 2.1427-4.6855 4.8047-4.6855zm.83984 1.1074c-2.4963 0-4.5078 1.9607-4.5078 4.3945v24.602c0 2.4338 2.0116 4.3945 4.5078 4.3945h25.23c2.4963 0 4.5078-1.9607 4.5078-4.3945v-24.602c0-2.4338-2.0116-4.3945-4.5078-4.3945h-25.23zm20.492 11.256a5.9606 5.9606 0 01.125 0 5.9606 5.9606 0 015.959 5.959 5.9606 5.9606 0 01-5.959 5.959 5.9606 5.9606 0 01-5.9629-5.959 5.9606 5.9606 0 015.8379-5.959zm.125 1.4453a4.5134 4.5134 0 00-4.5137 4.5137 4.5134 4.5134 0 004.5137 4.5137 4.5134 4.5134 0 004.5117-4.5137 4.5134 4.5134 0 00-4.5117-4.5137zm-18.609.14844a4.3661 4.3661 0 012.2793.58398 4.3661 4.3661 0 012.0449 2.6992h3.0117c.39944 0 .7207.32127.7207.7207v.72266c0 .39944-.32126.7207-.7207.7207h-3.0117a4.3661 4.3661 0 01-.44727 1.1016 4.3661 4.3661 0 01-5.9648 1.5977 4.3661 4.3661 0 01-1.5977-5.9648 4.3661 4.3661 0 013.6855-2.1816zm18.609 1a3.3644 3.3644 0 013.3633 3.3652 3.3644 3.3644 0 01-3.3633 3.3652 3.3644 3.3644 0 01-3.3652-3.3652 3.3644 3.3644 0 013.3652-3.3652zm-18.57.58203a2.7845 2.7845 0 00-2.3555 1.3906 2.7845 2.7845 0 001.0195 3.8027 2.7845 2.7845 0 003.8027-1.0176 2.7845 2.7845 0 00-1.0176-3.8027 2.7845 2.7845 0 00-1.4492-.37305z'
        />
      </svg>
    ),
    onClick: action('Menu Item 1')
  }
]

/// /////////////////////////////////////////////////////////
// Components

const TopMenuComponent: React.FunctionComponent = () => {
  const [needle, setNeedle] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onNeedleChange: OnNeedleChangeCallback = newNeedle => {
    setNeedle(newNeedle)
    action('needle change')(newNeedle)
  }
  const onSearch: OnSearchCallback = () => {
    setIsLoading(!isLoading)
    action('search')()
  }

  const searchBar = (
    <SearchBar
      needle={needle}
      onNeedleChange={onNeedleChange}
      onSearch={onSearch}
      isLoading={isLoading}
    />
  )

  return (
    <article className='story-article'>
      <h2>Top Menu</h2>
      <p>
        The top menu is displayed at the top of the popup. The search function
        is central to the functionality of the popup and therefore the search
        bar is emphasized.
      </p>
      <h2>Interactive Top Menu (search to toggle loading)</h2>
      <TopMenu searchBar={searchBar} menuItems={menuItems} />
    </article>
  )
}

export const Popup: React.FunctionComponent = () => {
  return (
    <section className='story-section'>
      <article className='story-article'>
        <h1>Popup</h1>
        <p>
          The popup will be displayed when the user clicks the StoredSafe icon
          in the top bar of the browser, or when some other script triggers it
          to be opened.
        </p>
        <p>
          Here you can see the Popup component broken down into its individual
          components and different states.
        </p>
      </article>
      <TopMenuComponent />
    </section>
  )
}