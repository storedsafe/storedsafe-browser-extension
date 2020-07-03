import React from 'react'
import icons from './icons'
import './SearchTitle.scss'

interface SearchTitleProps {
  host?: string
  result: SSObject
}

export const SearchTitle: React.FunctionComponent<SearchTitleProps> = ({
  host,
  result
}: SearchTitleProps) => (
  <article
    style={{ backgroundImage: `url('${icons[result.icon]}')` }}
    className='search-title'
  >
    <div className='search-title-text'>
      <p className='search-title-name'>{result.name}</p>
      {host !== undefined && <p className='search-title-host'>{host}</p>}
    </div>
  </article>
)
