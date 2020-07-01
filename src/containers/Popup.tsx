/**
 * Intermediary with the purpose of injecting data from external APIs into the
 * Popup UI.
 */
import React from 'react'
import { Popup, PopupProps } from '../components/Popup'

const usePopup = (): PopupProps => {
  function openOptions (): void {
    browser.runtime.openOptionsPage().catch(error => {
      console.error(error)
    })
  }

  return {
    numSessions: 0,
    searchResults: new Map(),
    search: () => {},
    openOptions: openOptions
  }
}

const PopupContainer: React.FunctionComponent = () => {
  const popupProps = usePopup()

  return (
    <Popup {...popupProps }/>
  )
}

export default PopupContainer
