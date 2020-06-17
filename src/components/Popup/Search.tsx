import React from 'react';
import { ListView } from '../common';
import * as Search from '../Search';
import './Search.scss';

export interface SearchStatus {
  [host: string]: {
    loading: boolean;
    error?: string;
  };
}

export interface SearchProps {
  hosts: string[];
  results: Results;
  onShow: Search.OnShowCallback;
  onCopy: Search.OnCopyCallback;
  onFill: Search.OnFillCallback;
  searchStatus: SearchStatus;
}

const PopupSearch: React.FunctionComponent<SearchProps> = ({
  hosts,
  results,
  onShow,
  onCopy,
  onFill,
  searchStatus,
}: SearchProps) => {
  const numResults = [...results.keys()].reduce((acc, host) => (
    acc + results.get(host).length
  ), 0);
  const isLoading = Object.values(searchStatus).reduce((loading, status) => {
    return loading || status.loading;
  }, false);

  if (numResults === 0 && !isLoading) {
    return (
      <section className="popup-search popup-search-empty">
        <p>No results found</p>
      </section>
    );
  }

  // Initialize selected to first object if it exists.
  let firstHost: string = undefined, firstId: number = undefined;
  for (const [host, hostResults] of results) {
    if (hostResults.length > 0) {
      firstHost = host;
      firstId = 0;
    }
  }

  const items = Array.from(results.keys()).reduce(((acc, host) => ([
    ...acc,
    ...results.get(host).map(((ssObject, resultId) => ({
      key: host + resultId,
      title: <Search.SearchTitle
        host={hosts.length > 0 ? host : undefined}
        result={ssObject}
      />,
      content: <Search.ObjectView
        host={host}
        resultId={resultId}
        result={ssObject}
        onShow={onShow}
        onCopy={onCopy}
        onFill={onFill}
      />,
    })))
  ])), []);

  // Select the first result if there are no other results
  const defaultSelected = numResults === 1 ? firstHost + firstId : undefined;

  return (
    <section className="popup-search">
      <ListView items={items} defaultSelected={defaultSelected} />
    </section>
  );
};

export default PopupSearch;
