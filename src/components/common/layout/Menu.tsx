import React from 'react'
import './Menu.scss'

export interface MenuItem {
  title: string
  icon: React.ReactNode
  onClick: () => void
}

interface MenuProps {
  show: boolean
  items: MenuItem[]
  onClick?: () => void
}

export const Menu: React.FunctionComponent<MenuProps> = ({
  show,
  items,
  onClick: closeMenu
}: MenuProps) => {
  const onItemClick = (onClick: () => void) => {
    return (): void => {
      onClick()
      closeMenu?.()
    }
  }

  return (
    <section className={`menu${show ? ' show' : ''}`}>
      <div className='menu-backdrop'>
        <div className='menu-box'>
          {items.map(({ title, icon, onClick }) => (
            <article
              key={title}
              className='menu-item'
              onClick={onItemClick(onClick)}
            >
              <p>{title}</p>
              {icon}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
