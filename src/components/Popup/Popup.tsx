import React, { useState } from 'react'
import { TopMenu } from './layout/TopMenu'
import { Banner, MenuItem, LoadingComponent } from '../common/layout'
import { SearchBar, OnSearchCallback } from '../common/input'
import './Popup.scss'

export interface PopupProps {
  isInitialized: boolean
  menuItems: MenuItem[]
  find: (needle: string) => void
  page?: React.ReactNode
}

export const Popup: React.FunctionComponent<PopupProps> = ({
  isInitialized,
  menuItems,
  find,
  page
}: PopupProps) => {
  const [needle, setNeedle] = useState<string>('')

  if (!isInitialized) return <LoadingComponent />

  const onSearch: OnSearchCallback = () => {
    find(needle)
  }

  const searchBar = (
    <SearchBar
      needle={needle}
      onNeedleChange={setNeedle}
      onSearch={onSearch}
      isLoading={false}
    />
  )

  return (
    <section className='popup'>
      <Banner />
      <TopMenu
        searchBar={searchBar}
        menuItems={menuItems}
      />
      {page}
    </section>
  )
}
