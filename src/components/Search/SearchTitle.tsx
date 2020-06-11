import React from 'react';
import { SearchResult } from '../../model/Search';
import icons from '../../ico';
import './SearchTitle.scss';

interface SearchTitleProps {
  url?: string;
  result: SearchResult;
}

export const SearchTitle: React.FunctionComponent<SearchTitleProps> = ({
  url,
  result,
}: SearchTitleProps) => (
  <article
    style={{ backgroundImage: `url('${icons[result.icon]}')`}}
    className="search-title">
    <div className="search-title-text">
      <p className="search-title-name">{result.name}</p>
      {url && <p className="search-title-url">{url}</p>}
    </div>
  </article>
);
