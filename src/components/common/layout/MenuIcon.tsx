import React from 'react'
import './MenuIcon.scss'

interface MenuIconProps {
  selected: boolean
}

export const MenuIcon: React.FunctionComponent<MenuIconProps> = ({
  selected
}: MenuIconProps) => {
  return (
    <div className={`menu-icon${selected ? ' selected' : ''}`}>
      <div className='menu-icon-bar menu-icon-bar-1' />
      <div className='menu-icon-bar menu-icon-bar-2' />
      <div className='menu-icon-bar menu-icon-bar-3' />
    </div>
  )
}
