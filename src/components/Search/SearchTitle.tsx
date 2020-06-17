import React from 'react';
import icons from '../../ico';
import './SearchTitle.scss';

interface SearchTitleProps {
  host?: string;
  result: SSObject;
}

export const SearchTitle: React.FunctionComponent<SearchTitleProps> = ({
  host,
  result,
}: SearchTitleProps) => {
  console.log(host, result);
  console.log(icons, icons[result.icon]);
  return (
    <article
      style={{ backgroundImage: `url('${icons[result.icon]}')`}}
      className="search-title">
      <div className="search-title-text">
        <p className="search-title-name">{result.name}</p>
        {host && <p className="search-title-host">{host}</p>}
      </div>
    </article>
  );
}
