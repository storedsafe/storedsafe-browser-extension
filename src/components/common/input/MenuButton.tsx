import React from 'react'
import './MenuButton.scss'

interface CustomMenuButtonProps {
  icon: React.ReactNode
}

type ButtonAttrs = React.ButtonHTMLAttributes<HTMLButtonElement>
type DetailedButtonAttrs = React.DetailedHTMLProps<ButtonAttrs, HTMLButtonElement>
type MenuButtonProps = CustomMenuButtonProps & DetailedButtonAttrs

export const MenuButton: React.FunctionComponent<MenuButtonProps> = ({
  icon,
  className,
  ...props
}: MenuButtonProps) => {
  const classNames = ['menu-button', className].join(' ')

  return (
    <button className={classNames} {...props}>
      {icon}
    </button>
  )
}
