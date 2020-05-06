import React, { Fragment, useState, useEffect } from 'react';
import StoredSafe, { StoredSafeObject, StoredSafeTemplate } from 'storedsafe';
import { useStorage } from '../../../state/StorageState';
import { VaultObject } from '../../Layout/VaultObject';
import './Search.scss';

type SearchResults = { [url: string]: [StoredSafeObject, StoredSafeTemplate][] };

interface SearchProps {
  selected: boolean;
  setActive: () => void;
}

export const Search: React.FunctionComponent<SearchProps> = ({
  selected,
  setActive,
}: SearchProps) => {
  const [state] = useStorage();
  const [needle, setNeedle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResults>({});

  useEffect(() => {
    const search = (): void => {
      setLoading(true);
      const promises: Promise<SearchResults>[] = [];
      Object.keys(state.sessions).forEach((url) => {
        const { apikey, token } = state.sessions[url];
        const storedSafe = new StoredSafe(url, apikey, token);
        const promise = storedSafe.find(needle).then((response) => {
          console.log(response.data);
          if (response.status === 200) {
            const ssResult: SearchResults = {
              [url]: Object.keys(response.data.OBJECT).map((id) => {
                const ssObject: StoredSafeObject = response.data.OBJECT[id];
                const ssTemplate: StoredSafeTemplate = response.data.TEMPLATESINFO[ssObject.templateid];
                return [ssObject, ssTemplate];
              }),
            };
            return ssResult;
          }
          console.log(response.status, response.statusText);
          return { [url]: [] };
        }).catch((error) => {
          console.log(error);
          return { [url]: [] };
        });
        promises.push(promise);
      });
      Promise.all(promises).then((promiseResults) => {
        setLoading(false);
        let searchResults = {};
        promiseResults.forEach((result) => searchResults = { ...searchResults, ...result });
        setResults(searchResults);
      });
    };

    if (needle !== '') {
      const id = setTimeout(search, 1000);
      return (): void => clearTimeout(id);
    }

  }, [needle, state.sessions]);

  return (
    <section className={`search${selected ? ' selected' : ''}`}>
      <label className="search-bar-label" htmlFor="search">
        Search
        <input
          className="search-bar"
          id="search"
          type="search"
          placeholder="search"
          value={needle}
          onFocus={setActive}
          onChange={({ target }: React.ChangeEvent<HTMLInputElement>): void => setNeedle(target.value)}
        />
    </label>
    <article className="search-results">
      {needle === '' && (
        <div className="search-empty">No results found</div>
      )}
      {needle !== '' && (
        <Fragment>
          {loading && <p>Loading...</p>}
          {!loading && Object.keys(results).map((url) => {
            return (
              <div key={url} className="search-result">
                <h3 className="search-result-url">{url}</h3>
                {results[url].map(([ssObject, ssTemplate], index) => (
                  <VaultObject key={index} ssObject={ssObject} ssTemplate={ssTemplate} />
                ))}
              </div>
            );
          })}
        </Fragment>
      )}
    </article>
  </section>
  );
}
