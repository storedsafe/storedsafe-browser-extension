import React from 'react'
import './Message.scss'

interface MessageProps {
  type?: 'info' | 'warning' | 'error'
  children?: React.ReactNode
}

export const Message: React.FunctionComponent<MessageProps> = ({
  type,
  children
}: MessageProps) => {
  return (
    <div className={`message ${type}`}>
      {children}
    </div>
  )
}

Message.defaultProps = {
  type: 'info'
}
