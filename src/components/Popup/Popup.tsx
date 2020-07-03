import React, { useState, useEffect, useCallback } from 'react'
import { TopMenu } from './layout/TopMenu'
import { Banner, MenuItem, LoadingComponent } from '../common/layout'
import { SearchBar, OnSearchCallback } from '../common/input'
import './Popup.scss'
import { useLoading } from '../../hooks/utils/useLoading'

export interface PopupProps {
  isInitialized: boolean
  isOnline: boolean
  menuItems: MenuItem[]
  onFocus: () => void
  find: (needle: string) => Promise<void>
  page?: React.ReactNode
}

export const Popup: React.FunctionComponent<PopupProps> = ({
  isInitialized,
  isOnline,
  menuItems,
  onFocus,
  find,
  page
}: PopupProps) => {
  const [needle, setNeedle] = useState<string>('')
  const [state, setPromise] = useLoading()

  const onSearch: OnSearchCallback = useCallback(() => {
    setPromise(find(needle), needle)
  }, [needle, setPromise, find])

  useEffect(() => {
    let mounted = true
    const search = (): void => {
      if (state?.key !== needle) {
        if (mounted) onSearch()
      }
    }
    // Search when there's 500ms since the last keystroke.
    const id = setTimeout(search, 500)
    return (): void => {
      mounted = false
      clearTimeout(id)
    }
  }, [needle, state?.key, onSearch])

  if (!isInitialized) return <LoadingComponent />

  const searchBar = (
    <SearchBar
      needle={needle}
      onNeedleChange={setNeedle}
      onSearch={onSearch}
      onFocus={onFocus}
      isLoading={state.isLoading}
      disabled={!isOnline}
    />
  )

  return (
    <section className='popup'>
      <Banner />
      <TopMenu searchBar={searchBar} menuItems={menuItems} />
      <article className='popup-page'>{page}</article>
    </section>
  )
}
