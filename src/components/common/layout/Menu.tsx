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
}

export const Menu: React.FunctionComponent<MenuProps> = ({
  show,
  items
}: MenuProps) => {
  const onItemClick = (onClick: () => void) => {
    return (event: React.MouseEvent): void => {
      event.stopPropagation()
      onClick()
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
