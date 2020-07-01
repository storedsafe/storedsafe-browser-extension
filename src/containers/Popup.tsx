/**
 * Intermediary with the purpose of injecting data from external APIs into the
 * Popup UI.
 */
import React, { useState, useEffect } from 'react'
import { Popup, PopupProps } from '../components/Popup'
import { useSessions } from '../hooks/storage/useSessions'
import { MenuItem, icons } from '../components/common/layout'
import { actions as StoredSafeActions } from '../model/storedsafe/StoredSafe'
import Auth from './Auth'

enum Page {
  AUTH,
  OPTIONS
}

const usePopup = (): PopupProps => {
  const sessions = useSessions()
  const [page, setPage] = useState<Page>()

  // function openOptions (): void {
  //   browser.runtime
  //     .openOptionsPage()
  //     .then(() => {
  //       window.close()
  //     })
  //     .catch(error => {
  //       console.error(error)
  //     })
  // }

  const menuItems: MenuItem[] = [
    {
      title: sessions.isOnline ? 'Sesssions' : 'Login',
      icon: sessions.isOnline ? icons.vault_unlocked : icons.vault_locked,
      onClick: () => setPage(Page.AUTH)
    },
    { title: 'Options', icon: icons.options, onClick: () => setPage(Page.OPTIONS) }
  ]

  const pages: Map<Page, React.ReactNode> = new Map([
    [Page.AUTH, <Auth key={'auth'} />],
    [
      Page.OPTIONS,
      <form key={'options'}>
        <label>
          <span>Host</span>
          <input type='text' />
        </label>
      </form>
    ]
  ])

  useEffect(() => {
    if (!sessions.isOnline) {
      setPage(Page.AUTH)
    }
  }, [sessions.isOnline])

  useEffect(() => {
    StoredSafeActions.checkAll().catch(error => {
      console.error(error)
    })
  }, [])

  return {
    isInitialized: sessions.isInitialized,
    menuItems,
    find: () => {},
    page: pages.get(page) !== undefined ? pages.get(page) : null
  }
}

const PopupContainer: React.FunctionComponent = () => {
  const popupProps = usePopup()

  return <Popup {...popupProps} />
}

export default PopupContainer
