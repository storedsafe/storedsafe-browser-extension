import React from 'react';
import { Message, LoadingComponent } from '../common';
import icons from '../../ico';
import './SearchResults.scss';

type SearchStatus = Map<string /* host */, {
  loading: boolean;
  error?: string;
}>;

interface SearchResultProps {
  result: SSObject;
  onClick: () => void;
  selected: boolean;
}

const SearchResult: React.FunctionComponent<SearchResultProps> = ({
  result,
  onClick,
  selected,
}: SearchResultProps) => (
  <article
    style={{ backgroundImage: `host('${icons[result.icon]}')`}}
    className={`search-result${selected ? ' selected' : ''}`}
    onClick={onClick}>
    <div className="search-result-text">
      <p>{result.name}</p>
      <p>{result.type}</p>
    </div>
  </article>
);

export interface SearchResultsProps {
  hosts: string[];
  results: Results;
  onSelect: (selected: { host: string; id: string }) => void;
  selected?: {
    host: string;
    id: string;
  };
  searchStatus: SearchStatus;
}

export const SearchResults: React.FunctionComponent<SearchResultsProps> = ({
  hosts,
  results,
  onSelect,
  selected,
  searchStatus,
}: SearchResultsProps) => (
  <section className="search-results">
    {hosts.map((host) => (
      // Hide host results if there is nothing to show..
      (results.get(host) || searchStatus.get(host) && (searchStatus.get(host).loading || searchStatus.get(host).error)) && (
        <article key={host} className="search-results-site">
          {/* Only show host if more than one session is active. */}
          {hosts.length > 1 && (
            <div className="search-results-host">
              {host} {searchStatus.get(host) && searchStatus.get(host).loading && <span className="searching" />}
              {searchStatus.get(host) && searchStatus.get(host).error && (
                <Message type="error">
                  {searchStatus.get(host) && searchStatus.get(host).error}
                </Message>
              )}
            </div>
          )}
          {hosts.length === 1 && searchStatus.get(host) && searchStatus.get(host).error && (
            <Message type="error">
              {searchStatus.get(host) && searchStatus.get(host).error}
            </Message>
          )}
          {hosts.length === 1 && searchStatus.get(host) && searchStatus.get(host).loading && (
            <LoadingComponent />
          )}
          {results.get(host) && results.get(host).map((ssObject, resultId) => (
            <SearchResult
              key={`${host}-${ssObject.id}`}
              onClick={(): void => onSelect({ host, id: ssObject.id })}
              selected={selected && selected.host === host && selected.id === ssObject.id}
              result={results.get(host)[resultId]}
            />
          ))}
        </article>
      )
    ))}
  </section>
);
