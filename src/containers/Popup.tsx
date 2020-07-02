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
import Options from './Options'

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
    {
      title: 'Options',
      icon: icons.options,
      onClick: () => setPage(Page.OPTIONS)
    }
  ]

  /**
   * Open the provided host in a new tab or focus an existing one if one
   * already exists. If a tab exists in the current window or in any other
   * window, that tab and window will be focused.
   * @param host - Host URL to go to.
   */
  const goto = (host: string): void => {
    browser.tabs
      .query({ url: `*://${host}/*` })
      .then(async tabs => {
        if (tabs.length === 0) {
          return await browser.tabs.create({ url: `https://${host}/` })
        }
        let selectedTab = tabs[0]
        for (const tab of tabs) {
          console.log(selectedTab)
          if (tab.lastAccessed > selectedTab.lastAccessed) {
            selectedTab = tab
          }
        }
        await browser.tabs.update(selectedTab.id, { active: true })
        await browser.windows.update(selectedTab.windowId, { focused: true })
      })
      .catch(error => console.error(error))
  }

  const pages: Map<Page, React.ReactNode> = new Map([
    [Page.AUTH, <Auth key={'auth'} goto={goto} />],
    [Page.OPTIONS, <Options key={'options'} />]
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
