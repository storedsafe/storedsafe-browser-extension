import React from 'react';
import { SearchBar, SearchBarProps } from './SearchBar';
import { SearchResults, SearchResultsProps } from './SearchResults';
import './Search.scss';

interface SearchProps extends SearchBarProps, SearchResultsProps {}

export const Search: React.FunctionComponent<SearchProps> = ({
  needle,
  onChange,
  onSearch,
  results,
  onSelect,
  selected,
}: SearchProps) => (
  <section className="search">
    <SearchBar needle={needle} onChange={onChange} onSearch={onSearch} />
    <SearchResults results={results} onSelect={onSelect} selected={selected} />
  </section>
);
