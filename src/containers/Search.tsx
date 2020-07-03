import React from 'react'
import { SearchProps, Search } from '../components/Search/Search'

const SearchContainer: React.FunctionComponent<SearchProps> = (
  props: SearchProps
) => {
  return <Search {...props} />
}

export default SearchContainer
