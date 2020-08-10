import React from 'react'
import { ListView, ListItem, Message } from '../common/layout'
import { SearchTitle } from './layout/SearchTitle'
import { ObjectView } from './layout/ObjectView'
import './Search.scss'

export interface SearchProps {
  isInitialized: boolean
  results: Results
  errors: Map<string, Error>
  fill: (host: string, id: number) => Promise<void>
  copy: (host: string, id: number, fieldId: number) => Promise<void>
  show: (host: string, id: number, fieldId: number) => Promise<void>
  goto: (host: string) => void
}

export const Search: React.FunctionComponent<SearchProps> = ({
  isInitialized,
  results,
  errors,
  fill,
  copy,
  show,
  goto
}: SearchProps) => {
  if (!isInitialized) return null

  let numResults = 0
  if (results !== undefined) {
    numResults = [...results.values()].reduce((acc, ssObjects) => acc + ssObjects.length, 0)
  }
  if (numResults === 0) {
    return (
      <section className='search'>
        <article className='search-empty'>No results found</article>
      </section>
    )
  }

  const items: ListItem[] = []
  for (const [host, ssObjects] of results) {
    if (errors.has(host)) {
      continue
    }

    ssObjects.forEach((ssObject, id) => {
      items.push({
        key: `${host}-${ssObject.id}`,
        title: <SearchTitle result={ssObject} host={results.size > 1 ? host : undefined} />,
        content: (
          <ObjectView
            host={host}
            result={ssObject}
            resultId={id}
            onCopy={copy}
            onFill={fill}
            onShow={show}
          />
        )
      })
    })
  }

  const defaultSelected = items.length === 1 ? items[0].key : undefined

  return (
    <section className='search'>
      <ListView items={items} defaultSelected={defaultSelected} />
    </section>
  )
}
