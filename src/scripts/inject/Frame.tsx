import React, { useRef, useEffect, useState } from 'react'
import ReactDOM, { createPortal } from 'react-dom'

export interface FrameProps {
  id: string
  style: React.CSSProperties
  src?: string
  children?: React.ReactNode
  head?: React.ReactNode
}

export const Frame: React.FunctionComponent<FrameProps> = ({
  id,
  style,
  src,
  children,
  head
}: FrameProps) => {
  const node = useRef<HTMLIFrameElement>(null)
  const [content, setContent] = useState<React.ReactNode>()

  useEffect(() => {
    if (node !== null) {
      setContent(children)
    }
  }, [node])

  return (
    <iframe
      src={src}
      id={id}
      ref={node}
      style={{ overflow: 'hidden', border: 'none', zIndex: 99999, ...style }}
    >
      {node.current !== null && [
        createPortal([<style key={'frame-body'}>{'body { overflow: hidden }</style>'}</style>, head], node.current?.contentDocument?.head),
        createPortal(content, node.current?.contentDocument?.body)
      ]}
    </iframe>
  )
}
