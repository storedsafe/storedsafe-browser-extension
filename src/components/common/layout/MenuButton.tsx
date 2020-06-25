import React from 'react'
import './MenuButton.scss'

interface MenuButtonProps {
  title: string
  icon: React.ReactNode
  onClick: () => void
  selected?: boolean
}

export const MenuButton: React.FunctionComponent<MenuButtonProps> = ({
  title,
  icon,
  onClick,
  selected
}: MenuButtonProps) => (
  <div className='menu-button' onClick={onClick}>
    <button
      className={`menu-button-icon${selected ? ' selected' : ''}`}
      aria-label={title}
    >
      {icon}
    </button>
    <div className='menu-button-title'>{title}</div>
  </div>
)

MenuButton.defaultProps = {
  selected: false
}
