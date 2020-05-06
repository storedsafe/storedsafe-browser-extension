import React from 'react';
import './Button.scss';

export interface CustomButtonProps {
  color?: 'primary' | 'accent' | 'warning' | 'danger';
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export type ButtonProps = CustomButtonProps & Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'className'>;

export const Button: React.FunctionComponent<ButtonProps> = ({
  color,
  isLoading,
  children,
  className,
  ...props
}: ButtonProps) => {
  const classNames = `button button-${color}${isLoading ? ' button-loading' : ''}${className === '' ? '' : ` ${className} `}`;

  return (
    <button className={classNames} {...props}>
      {children}
      <div className="button-spinner" />
    </button>
  );
};

Button.defaultProps = {
  color: 'primary',
  isLoading: false,
  children: null,
  className: '',
};
