import React, { useState } from 'react';
import { SearchResults } from '../../model/Search';
import { LoadingComponent } from '../common';
import * as Search from '../Search';
import './Search.scss';

export interface SearchStatus {
  [url: string]: {
    loading: boolean;
    error?: string;
  };
}

export interface SearchProps {
  urls: string[];
  results: SearchResults;
  onShow: (url: string, objectId: string, field: string) => void;
  onCopy: (url: string, objectId: string, field: string) => void;
  onFill: (url: string, objectId: string) => void;
  searchStatus: SearchStatus;
}

const PopupSearch: React.FunctionComponent<SearchProps> = ({
  urls,
  results,
  onShow,
  onCopy,
  onFill,
  searchStatus,
}: SearchProps) => {
  // Initialize selected to first object if it exists.
  let firstUrl: string = undefined, firstId: string = undefined;
  const resultUrls = Object.keys(results);
  for (let i = 0; i < resultUrls.length; i++) {
    const url = resultUrls[i];
    const ids = Object.keys(results[url]);
    if (ids.length > 0) {
      const id = ids[0];
      firstUrl = url;
      firstId = id;
    }
  }

  const [selected, setSelected] = useState<{
    url: string;
    id: string;
  }>({ url: firstUrl, id: firstId });

  const isLoading = Object.values(searchStatus).reduce((loading, status) => {
    return loading || status.loading;
  }, false);

  if (firstUrl === undefined && firstId === undefined) {
    if (isLoading) {
      return (
        <section className="popup-search content">
          <article><LoadingComponent /></article>
          <article></article>
        </section>
      );
    }
    return (
      <section className="popup-search popup-search-empty">
        <p>No results found</p>
      </section>
    );
  } else if (
    (results[selected.url] === undefined || results[selected.url][selected.id] === undefined) &&
    (firstUrl !== undefined && firstId !== undefined)
  ) {
    // Skip single frame while selected state updates.
    setSelected({ url: firstUrl, id: firstId });
    return null;
  }

  const { url, id } = selected;

  const left = <Search.SearchResults
    urls={urls}
    results={results}
    onSelect={(newSelected): void => setSelected(newSelected)}
    searchStatus={searchStatus}
  />;

  const right = <Search.ObjectView
    url={url}
    id={id}
    result={results[url][id]}
    onShow={onShow}
    onCopy={onCopy}
    onFill={onFill}
  />;

  return (
    <section className="popup-search content">
      <article>{left}</article>
      <article>{right}</article>
    </section>
  );
};

export default PopupSearch;
