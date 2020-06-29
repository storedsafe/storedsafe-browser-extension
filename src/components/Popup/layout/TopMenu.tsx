import React, { useState, useEffect } from 'react'
import { MenuIcon } from '../../common/layout/MenuIcon'
import { Menu, MenuItem } from '../../common/layout/Menu'
import './TopMenu.scss'
import { MenuButton } from '../../common/input/MenuButton'

export interface TopMenuProps {
  searchBar: React.ReactNode
  menuItems: MenuItem[]
  initialShowMenu?: boolean
}

export const TopMenu: React.FunctionComponent<TopMenuProps> = ({
  searchBar,
  menuItems,
  initialShowMenu
}: TopMenuProps) => {
  const [showMenu, setShowMenu] = useState<boolean>(initialShowMenu)

  useEffect(() => {
    setShowMenu(initialShowMenu)
  }, [initialShowMenu])

  const toggleMenu = (): void => {
    setShowMenu(prevShowMenu => !prevShowMenu)
  }

  return (
    <section className='top-menu'>
      {searchBar}
      <MenuButton
        className={`top-menu-button menu-button ${showMenu ? ' selected' : ''}`}
        onClick={toggleMenu}
        icon={<MenuIcon selected={showMenu} />}
      />
      <Menu show={showMenu} items={menuItems} />
    </section>
  )
}
