import React from 'react'
import { ListView, ListItem, Message } from '../common/layout'
import { SearchTitle } from './layout/SearchTitle'
import { ObjectView } from './layout/ObjectView'
import './Search.scss'

export interface SearchProps {
  isInitialized: boolean
  results: SSObject[]
  errors: Map<string, Error>
  fill: (id: number) => Promise<void>
  copy: (id: number, fieldId: number) => Promise<void>
  show: (id: number, fieldId: number) => Promise<void>
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
    numResults = results.length
  }
  if (numResults === 0) {
    return (
      <section className='search'>
        <article className='search-empty'>No results found</article>
      </section>
    )
  }

  const hasMultiple =
    results.reduce((acc, res) => acc.add(res.host), new Set()).size > 1
  const items: ListItem[] = []
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (errors.has(result.host)) {
      continue
    }

    items.push({
      key: `${result.host}-${result.id}`,
      title: (
        <SearchTitle
          result={result}
          host={hasMultiple ? result.host : undefined}
        />
      ),
      content: (
        <ObjectView
          result={result}
          resultId={i}
          onCopy={copy}
          onFill={fill}
          onShow={show}
        />
      )
    })
  }

  const defaultSelected = items.length === 1 ? items[0].key : undefined

  return (
    <section className='search'>
      <ListView items={items} defaultSelected={defaultSelected} />
    </section>
  )
}
