import React, { useState, useEffect } from 'react';
import { SearchResults } from '../../../model/Search';
import * as Search from '../Search';
import './Search.scss';

export interface SearchProps {
  results: SearchResults;
  onDecrypt: (url: string, objectId: string, field: string) => void;
  onCopy: (url: string, objectId: string, field: string) => void;
  onFill: (url: string, objectId: string) => void;
}

const PopupSearch: React.FunctionComponent<SearchProps> = ({
  results,
  onDecrypt,
  onCopy,
  onFill,
}: SearchProps) => {
  // Initialize selected to first object
  let firstUrl: string = undefined, firstId: string = undefined;
  const urls = Object.keys(results);
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
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

  if (firstUrl == undefined && firstId === undefined) {
    return (
      <section className="popup-search popup-search-empty">
        <p>No results found</p>
      </section>
    );
  }

  const { url, id } = selected;

  const left = <Search.SearchResults
    results={results}
    onSelect={(newSelected): void => setSelected(newSelected)}
  />;

  const right = <Search.ObjectView
    url={url}
    id={id}
    result={results[url][id]}
    onDecrypt={onDecrypt}
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
