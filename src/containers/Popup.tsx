/**
 * Intermediary with the purpose of injecting data from external APIs into the
 * Popup UI.
 */
import React, { useState, useEffect, useMemo } from 'react'
import { useSessions } from '../hooks/storage/useSessions'
import { useSites } from '../hooks/storage/useSites'
import { actions as StoredSafeActions } from '../model/storedsafe/StoredSafe'
import { OnAddSiteCallback, OnRemoveSiteCallback } from '../components/Options'
import { TabValues } from '../components/Add/Add'
import Auth from './Auth'
import Options from './Options'
import Welcome from './Welcome'
import Add from './Add'
import Search from './Search'

import { Popup, PopupProps } from '../components/Popup'
import { MenuItem, icons } from '../components/common/layout'
import { useSearch } from '../hooks/utils/useSearch'

enum Page {
  AUTH,
  OPTIONS,
  WELCOME,
  ADD,
  SEARCH
}

const usePopup = (): PopupProps => {
  const sites = useSites()
  const sessions = useSessions()
  const [page, setPage] = useState<Page>()
  const [tabValues, setTabValues] = useState<TabValues>()
  const { find, ...searchProps } = useSearch()

  const isConfigured = useMemo(() => sites.all.length !== 0, [sites.all])

  let menuItems: MenuItem[] = []
  if (isConfigured) {
    if (sessions.isOnline) {
      menuItems.push({
        title: 'Add',
        icon: icons.add,
        onClick: () => setPage(Page.ADD)
      })
    }
    menuItems.push({
      title: sessions.isOnline ? 'Sesssions' : 'Login',
      icon: sessions.isOnline ? icons.vault_unlocked : icons.vault_locked,
      onClick: () => setPage(Page.AUTH)
    })
    menuItems.push({
      title: 'Options',
      icon: icons.options,
      onClick: () => setPage(Page.OPTIONS)
    })
  } else {
    menuItems = [
      {
        title: 'Setup',
        icon: icons.options,
        onClick: () => setPage(Page.WELCOME)
      }
    ]
  }

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
          if (tab.lastAccessed > selectedTab.lastAccessed) {
            selectedTab = tab
          }
        }
        await browser.tabs.update(selectedTab.id, { active: true })
        await browser.windows.update(selectedTab.windowId, { focused: true })
      })
      .catch(error => console.error(error))
  }

  const addSite: OnAddSiteCallback = async site => {
    if (sites.all.reduce((acc, { host }) => acc || site.host === host, false)) {
      throw new Error(`${site.host} already exists.`)
    }
    await sites.add(site)
  }

  const removeSite: OnRemoveSiteCallback = async id => {
    const host = sites.user[id].host
    if (sessions.sessions.has(host)) {
    }
    await sites.remove(id)
    await StoredSafeActions.logout(host)
  }

  function clearTabValues (): void {
    setTabValues(undefined)
  }

  function onFocus (): void {
    setPage(Page.SEARCH)
  }

  const pages: Map<Page, React.ReactNode> = new Map([
    [Page.AUTH, <Auth key='auth' goto={goto} />],
    [Page.OPTIONS, <Options key='options' {...{ addSite, removeSite }} />],
    [Page.WELCOME, <Welcome key='welcome' {...{ addSite, removeSite }} />],
    [
      Page.ADD,
      <Add tabValues={tabValues} clearTabValues={clearTabValues} key='add' />
    ],
    [Page.SEARCH, <Search key='search' goto={goto} {...searchProps} />]
  ])

  useEffect(() => {
    let mounted = true
    if (!isConfigured) {
      if (mounted) setPage(Page.WELCOME)
    } else if (!sessions.isOnline) {
      if (mounted) setPage(Page.AUTH)
    }
    return () => { mounted = false }
  }, [sessions.isOnline, isConfigured])

  useEffect(() => {
    StoredSafeActions.checkAll().catch(error => {
      console.error(error)
    })
  }, [])

  browser.runtime.onMessage.addListener(message => {
    if (message.type === 'save') {
      const { data } = message
      setTabValues(data)
    }
  })

  const isInitialized = sessions.isInitialized && sites.isInitialized

  return {
    isInitialized,
    isOnline: sessions.isOnline,
    menuItems,
    onFocus,
    find,
    page: pages.get(page) !== undefined ? pages.get(page) : null
  }
}

const PopupContainer: React.FunctionComponent = () => {
  const popupProps = usePopup()

  return <Popup {...popupProps} />
}

export default PopupContainer
