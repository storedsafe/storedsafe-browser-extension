import React, { Fragment, useState, useEffect } from 'react';
import StoredSafe, { StoredSafeObject, StoredSafeTemplate } from 'storedsafe';
import { useStorage } from '../../../state/StorageState';
import { LoadingSpinner, VaultObject, Button } from '../../Layout';
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
    const onMessageListener = ({
      type,
      data,
    }: {
      type: string;
      data: { url: string };
    }): void => {
      if (type === 'popup-search') {
        const match = data.url.match(/https?:\/\/([^/]*)\//);
          const searchTerm = match === null ? 'fail' : match[1];
          setNeedle(searchTerm);
      }
    }
    browser.runtime.onMessage.addListener(onMessageListener);
    return (): void => { browser.runtime.onMessage.removeListener(onMessageListener) };
  }, []);

  useEffect(() => {
    const search = (): void => {
      const promises: Promise<SearchResults>[] = [];
      Object.keys(state.sessions).forEach((url) => {
        const { apikey, token } = state.sessions[url];
        const storedSafe = new StoredSafe(url, apikey, token);
        const promise = storedSafe.find(needle).then((response) => {
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
      setLoading(true);
      const id = setTimeout(search, 1000);
      return (): void => clearTimeout(id);
    } else {
      setLoading(false);
    }

  }, [needle, state.sessions]);

  const onClick = (url: string, id: string): void => {
    const { apikey, token } = state.sessions[url];
    const storedSafe = new StoredSafe(url, apikey, token);
    storedSafe.objectDecrypt(id).then((response) => {
      if (response.status === 200) {
        const data: { [field: string]: string } = {};
        const obj = response.data.OBJECT[id];
        Object.keys(obj.public).forEach((field) => {
          data[field] = obj.public[field];
        });
        Object.keys(obj.crypted).forEach((field) => {
          data[field] = obj.crypted[field];
        });
        browser.tabs.query({ active: true }).then((tabs) => {
          const activeTab = tabs.find((tab) => tab.active)
          if (activeTab) {
            browser.tabs.sendMessage(activeTab.id, {
              type: 'fill',
              data,
            }).then(() => {
              window.close();
            });
          }
        });
      }
    });
  };

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
          {loading && <LoadingSpinner />}
          {!loading && Object.keys(results).map((url) => {
            return (
              <div key={url} className="search-result">
                <h3 className="search-result-url">{url}</h3>
                {results[url].map(([ssObject, ssTemplate], index) => (
                  <Fragment key={index}>
                    <VaultObject ssObject={ssObject} ssTemplate={ssTemplate} />
                    <Button onClick={(): void => onClick(url, ssObject.id)}>Fill</Button>
                  </Fragment>
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
