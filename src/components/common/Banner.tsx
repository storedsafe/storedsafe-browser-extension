import React from 'react'
import { Logo } from './Logo'
import './Banner.scss'

interface BannerProps {
  children?: React.ReactNode
}

export const Banner: React.FunctionComponent<BannerProps> = ({
  children
}: BannerProps) => (
  <div className="banner">
    <Logo />
    {children}
  </div>
)
