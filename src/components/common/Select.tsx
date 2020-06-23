import React from 'react'
import './Select.scss'

type SelectProps = React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & { children: React.ReactNode }

export const Select: React.FunctionComponent<SelectProps> = ({
  children, ...props
}: SelectProps) => (
  <div className="select">
    <div className="custom-select">
      <select {...props}>
        {children}
      </select>
    </div>
  </div>
)
