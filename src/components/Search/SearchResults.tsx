import React from 'react';
import { SearchResults as Results, SearchResult as Result } from '../../model/Search';
import icons from '../../ico';
import './SearchResults.scss';

interface SearchResultProps {
  result: Result;
  onClick: () => void;
  selected: boolean;
}

const SearchResult: React.FunctionComponent<SearchResultProps> = ({
  result,
  onClick,
  selected,
}: SearchResultProps) => (
  <article
    style={{ backgroundImage: `url('${icons[result.icon]}')`}}
    className={`search-result${selected ? ' selected' : ''}`}
    onClick={onClick}>
    <div className="search-result-text">
      <p>{result.name}</p>
      <p>{result.type}</p>
    </div>
  </article>
);

export interface SearchResultsProps {
  results: Results;
  onSelect: (selected: { url: string; id: string }) => void;
  selected?: {
    url: string;
    id: string;
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
        {Object.keys(results).length > 1 && (
          <div className="search-results-url">
            {url} {/* TODO: Fix separate loading {<span className="searching" />}*/}
          </div>
        )}
        {Object.keys(results[url].objects).map((id) => (
          <SearchResult
            key={id}
            onClick={(): void => onSelect({ url, id })}
            selected={selected && selected.url === url && selected.id === id}
            result={results[url].objects[id]}
          />
        ))}
      </article>
    ))}
  </section>
);
