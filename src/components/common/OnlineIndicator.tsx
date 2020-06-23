import React from 'react'
import './OnlineIndicator.scss'

interface OnlineIndicatorProps {
  online: boolean
}

export const OnlineIndicator: React.FunctionComponent<OnlineIndicatorProps> = ({
  online
}: OnlineIndicatorProps) => (
  <div className={`online-indicator ${online ? 'online' : 'offline'}`}>
    <div className="online-indicator-icon" />
  </div>
)
