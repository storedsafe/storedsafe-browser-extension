import React from 'react';
import { StoredSafeObject, StoredSafeTemplate } from 'storedsafe';
import icons from '../../../ico';
import './SearchResults.scss';

interface SearchResultProps {
  ssObject: StoredSafeObject;
  ssTemplate: StoredSafeTemplate;
  onClick: () => void;
  selected: boolean;
}

const SearchResult: React.FunctionComponent<SearchResultProps> = ({
  ssObject,
  ssTemplate,
  onClick,
  selected,
}: SearchResultProps) => (
  <article
    style={{ backgroundImage: `url('${icons[ssTemplate.INFO.ico]}')`}}
    className={`search-result${selected ? ' selected' : ''}`}
    onClick={onClick}>
    <div className="search-result-text">
      <p>{ssObject.objectname}</p>
      <p>{ssTemplate.INFO.name}</p>
    </div>
  </article>
);

export interface SearchResultsProps {
  results: {
    [url: string]: {
      ssObject: StoredSafeObject;
      ssTemplate: StoredSafeTemplate;
    }[];
  };
  onSelect: (url: string, id: number) => void;
  selected?: {
    url: string;
    id: number;
  };
}

export const SearchResults: React.FunctionComponent<SearchResultsProps> = ({
  results,
  onSelect,
  selected,
}: SearchResultsProps) => (
  <section className="search-results">
    {Object.keys(results).map((url) => (
      <article key={url} className="search-results-site">
        <div className="search-results-url">
          {url}
        </div>
        {results[url].map((result, index) => (
          <SearchResult
            key={index}
            onClick={(): void => onSelect(url, index)}
            selected={selected && selected.url === url && selected.id === index}
            {...result}
          />
        ))}
      </article>
    ))}
  </section>
);
