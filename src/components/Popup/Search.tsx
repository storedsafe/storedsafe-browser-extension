import React from 'react';
import { SearchResults } from '../../model/Search';
import { LoadingComponent } from '../common';
import { ListView } from '../common';
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
  const numResults = Object.keys(results).reduce((acc, url) => acc + Object.keys(results[url]).length, 0);
  const isLoading = Object.values(searchStatus).reduce((loading, status) => {
    return loading || status.loading;
  }, false);

  if (numResults === 0) {
    if (isLoading) {
      return (
        <section className="popup-search popup-search-loading">
          <LoadingComponent />
        </section>
      );
    }
    return (
      <section className="popup-search popup-search-empty">
        <p>No results found</p>
      </section>
    );
  }

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

  const items = Object.keys(results).reduce(((acc, url) => ([
    ...acc,
    ...Object.keys(results[url]).map(((id) => ({
      key: url + id,
      title: <Search.SearchTitle
        url={url}
        result={results[url][id]}
      />,
      content: <Search.ObjectView
        url={url}
        id={id}
        result={results[url][id]}
        onShow={onShow}
        onCopy={onCopy}
        onFill={onFill}
      />,
    })))
  ])), []);

  // Select the first result if there are no other results
  const defaultSelected = numResults === 1 ? firstUrl + firstId : undefined;

  return (
    <section className="popup-search">
      <ListView items={items} defaultSelected={defaultSelected} />
    </section>
  );
};

export default PopupSearch;
