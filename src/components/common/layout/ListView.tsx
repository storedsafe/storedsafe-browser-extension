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
  const defaultExists = items.findIndex(({ key }) => defaultSelected) !== -1
  const [selected, setSelected] = useState<string>(defaultExists ? defaultSelected : undefined)

  useEffect(() => {
    const newDefaultExists = items.findIndex(({ key }) => defaultSelected) !== -1
    setSelected(newDefaultExists ? defaultSelected : undefined)
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

    const classNames = [
      'list-view-item',
      isSelected ? 'selected' : hasSelected ? 'hidden' : ''
    ].join(' ')

    return (
      <article className={classNames} key={item.key}>
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
