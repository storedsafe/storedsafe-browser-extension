import React from 'react'
import './Button.scss'

export type ButtonColor = 'primary' | 'accent' | 'warning' | 'danger'

export interface CustomButtonProps {
  color?: ButtonColor
  isLoading?: boolean
}

type ButtonAttrs = React.ButtonHTMLAttributes<HTMLButtonElement>
type DetailedButtonAttrs = React.DetailedHTMLProps<ButtonAttrs, HTMLButtonElement>
export type ButtonProps = CustomButtonProps & DetailedButtonAttrs

export const Button: React.FunctionComponent<ButtonProps> = ({
  color,
  isLoading,
  children,
  className,
  ...props
}: ButtonProps) => {
  const classNames = [
    `button button-${color}`,
    isLoading ? 'button-loading' : '',
    className
  ].join(' ')

  return (
    <button className={classNames} {...props}>
      <div className='button-children'>{children}</div>
      <div className='button-spinner' />
    </button>
  )
}

Button.defaultProps = {
  color: 'primary',
  isLoading: false,
  children: null,
  className: ''
}
