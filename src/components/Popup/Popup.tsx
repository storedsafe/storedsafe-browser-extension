import React, { useState, useEffect } from 'react';
import * as PopupUI from '../ui/Popup';
import { useStorage } from '../../hooks/useStorage';
import { LoadingComponent } from '../ui/common';
import Search from './PopupSearch';
import Sessions from './PopupSessions';
import svg from '../../ico/svg';

enum MenuItem {
  Search = 0,
  Sessions = 1,
  Settings = 2,
}

const menuItems = [
  {
    title: 'Search',
    icon: svg.search,
  },
  {
    title: 'Sessions',
    icon: svg.vault,
  },
  {
    title: 'Settings',
    icon: svg.settings,
  },
];


export const Popup: React.FunctionComponent = () => {
  const { state, isInitialized } = useStorage();
  const [menuItem, setMenuItem] = useState<number>();

  /**
   * Event handlers
   * */

  // Initialize to sessions if no sessions are active
  useEffect(() => {
    if (menuItem === undefined && isInitialized) {
      if (Object.keys(state.sessions).length > 0) {
        setMenuItem(MenuItem.Search);
      } else {
        setMenuItem(MenuItem.Sessions);
      }
    }
  }, [state, isInitialized, menuItem]);

  const onMenuSelect = (id: number): void => {
    if (id === MenuItem.Settings) {
      browser.runtime.openOptionsPage();
    } else {
      setMenuItem(id);
    }
  };

  /**
   * Components
   * */
  const menu = <PopupUI.Menu
    items={menuItems}
    selected={menuItem}
    onSelect={onMenuSelect}
  />;

  const status = <PopupUI.StatusBar
    activeSessions={Object.keys(state.sessions).length}
  />;

  let content: React.ReactNode;
  switch(menuItem) {
    case MenuItem.Search: {
      content = <Search />;
      break;
    }
    case MenuItem.Sessions: {
      content = <Sessions />;
      break;
    }
    default: {
      content = <LoadingComponent />;
    }
  }

  return (
    <PopupUI.Main
      menu={menu}
      content={content}
      status={status}
    />
  );
};
