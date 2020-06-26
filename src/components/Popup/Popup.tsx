import React, { useState } from 'react'
import { TopMenu, OnSearchCallback } from './TopMenu'
import { Logo } from '../common/layout/Logo'
import './Popup.scss'

interface PopupProps {
  searchResults: Results
  onSearch: (needle: string) => void
}

export const Popup: React.FunctionComponent = () => {
  const [needle, setNeedle] = useState<string>('')

  const onSearch: OnSearchCallback = () => {
    console.log(needle)
  }

  return (
    <section className='popup'>
      <TopMenu
        needle={needle}
        onNeedleChange={setNeedle}
        onSearch={onSearch}
        isLoading={false}
      />
      <Logo />
    </section>
  )
}
