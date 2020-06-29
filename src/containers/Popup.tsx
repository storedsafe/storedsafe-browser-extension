import React from 'react'
import { Popup } from '../components/Popup'

const PopupContainer: React.FunctionComponent = () => {
  const openOptions = (): void => {
    browser.runtime.openOptionsPage().catch(error => {
      console.error(error)
    })
  }

  return (
    <Popup
      numSessions={0}
      searchResults={new Map()}
      search={() => undefined}
      openOptions={openOptions}
    />
  )
}

export default PopupContainer
