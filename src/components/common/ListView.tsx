import React, { useState, useEffect } from 'react'
import './ListView.scss'

export interface ListItem {
  key: string
  title: React.ReactNode
  content: React.ReactNode
}

interface ListViewProps {
  items: ListItem[]
  defaultSelected?: string
}

export const ListView: React.FunctionComponent<ListViewProps> = ({
  items,
  defaultSelected
}: ListViewProps) => {
  const [selected, setSelected] = useState<string>(defaultSelected)

  useEffect(() => {
    setSelected(defaultSelected)
  }, [defaultSelected])

  const hasSelected = selected !== undefined

  const list = items.map(item => {
    const isSelected = selected === item.key
    const onSelect = (): void => {
      if (isSelected) {
        setSelected(undefined)
      } else {
        setSelected(item.key)
      }
    }
    return (
      <article
        className={`list-view-item${isSelected ? ' selected' : ''}${
          hasSelected && !isSelected ? ' hidden' : ''
        }`}
        key={item.key}
      >
        <article className='list-view-item-title' onClick={onSelect}>
          {item.title}
        </article>
        <article className='list-view-item-content'>{item.content}</article>
      </article>
    )
  })

  return (
    <section className={`list-view${hasSelected ? ' has-selected' : ''}`}>
      {list}
    </section>
  )
}
