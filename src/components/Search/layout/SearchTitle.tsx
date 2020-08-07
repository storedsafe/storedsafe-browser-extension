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
}: SearchTitleProps) => {
  const usernameField = result.fields.find(({ name }) => name === 'username')
  return (
    <article
      style={{ backgroundImage: `url('${icons[result.icon]}')` }}
      className='search-title'
      title={result.type}
    >
      <div className='search-title-text'>
        <p className='search-title-name'>{result.name}</p>
        {usernameField && usernameField.value !== result.name && <p className='search-title-username'>{usernameField.value}</p>}
        {host !== undefined && <p className='search-title-host'>{host}</p>}
      </div>
    </article>
  )
}
