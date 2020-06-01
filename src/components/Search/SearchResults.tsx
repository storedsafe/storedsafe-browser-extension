import React from 'react';
import { SearchResults as Results, SearchResult as Result } from '../../model/Search';
import { Message, LoadingComponent } from '../common';
import icons from '../../ico';
import './SearchResults.scss';

interface SearchStatus {
  [url: string]: {
    loading: boolean;
    error?: string;
  };
}

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
  urls: string[];
  results: Results;
  onSelect: (selected: { url: string; id: string }) => void;
  selected?: {
    url: string;
    id: string;
  };
  searchStatus: SearchStatus;
}

export const SearchResults: React.FunctionComponent<SearchResultsProps> = ({
  urls,
  results,
  onSelect,
  selected,
  searchStatus,
}: SearchResultsProps) => (
  <section className="search-results">
    {urls.map((url) => (
      // Hide url results if there is nothing to show..
      (results[url] || searchStatus[url] && (searchStatus[url].loading || searchStatus[url].error)) && (
        <article key={url} className="search-results-site">
          {/* Only show url if more than one session is active. */}
          {urls.length > 1 && (
            <div className="search-results-url">
              {url} {searchStatus[url] && searchStatus[url].loading && <span className="searching" />}
              {searchStatus[url] && searchStatus[url].error && (
                <Message type="error">
                  {searchStatus[url] && searchStatus[url].error}
                </Message>
              )}
            </div>
          )}
          {urls.length === 1 && searchStatus[url] && searchStatus[url].error && (
            <Message type="error">
              {searchStatus[url] && searchStatus[url].error}
            </Message>
          )}
          {urls.length === 1 && searchStatus[url] && searchStatus[url].loading && (
            <LoadingComponent />
          )}
          {results[url] && Object.keys(results[url]).map((id) => (
            <SearchResult
              key={id}
              onClick={(): void => onSelect({ url, id })}
              selected={selected && selected.url === url && selected.id === id}
              result={results[url][id]}
            />
          ))}
        </article>
      )
    ))}
  </section>
);
