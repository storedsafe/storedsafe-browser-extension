import React, { useState } from 'react'
import { SearchBar, OnSearchCallback } from './common/input/SearchBar'
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
      <SearchBar
        needle={needle}
        onNeedleChange={setNeedle}
        onSearch={onSearch}
        isLoading={false}
      />
    </section>
  )
}
