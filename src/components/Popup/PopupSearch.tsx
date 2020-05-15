import React, { useState, useEffect } from 'react';
import { StoredSafeObject, StoredSafeTemplate } from 'storedsafe';
import { useStorage } from '../../hooks/useStorage';
import { actions } from '../../model/StoredSafe';
import { SearchResults } from '../../model/Search';
import * as PopupUI from '../ui/Popup';
import { Search, ObjectView } from '../ui/Search';

const PopupSearch: React.FunctionComponent = () => {
  const { state } = useStorage();
  const [searching, setSearching] = useState<string>('');
  const [needle, setNeedle] = useState<string>('');
  const [results, setResults] = useState<SearchResults>({});
  const [selected, setSelected] = useState<{
    url: string;
    id: number;
  }>();

  useEffect(() => {
    browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
      const tab = tabs[0];
      const { url } = tab;
      const match = url.match(/^https?:\/\/(?:w{3}\.)?([^/]+)\/.*/);
      setNeedle(match === null ? url : match[1]);
    });
  }, []);

  /**
   * Events
   * */
  useEffect(() => {
    if (searching !== needle && needle !== '') {
      const search = (): void => {
        setSelected(undefined);
        setSearching(needle);
        actions.find(needle).then((searchPromises) => {
          const newResults: SearchResults = {};
          Object.keys(searchPromises).forEach((url) => {
            newResults[url] = { loading: true, results: [] };
          });
          setResults({ ...newResults });
          Object.keys(searchPromises).forEach((url) => {
            searchPromises[url].then((siteResults) => {
              newResults[url] = { loading: false, results: siteResults };
              setResults({ ...newResults });
            });
          });
        });
      };

      // Search after 1s of inactivity
      const id = setTimeout(search, 1000);
      return (): void => clearTimeout(id);
    }
  }, [needle, searching]);

  // Decrypt helper function
  const decrypt = (): Promise<{
    ssObject: StoredSafeObject;
    ssTemplate: StoredSafeTemplate;
  }> => {
    const { url, id } = selected;
    const objectId = results[url].results[id].ssObject.id;
    return actions.decrypt(url, objectId, state.sessions[url]);
  };

  // Decrypt field
  const onDecrypt = (): void => {
    const { url, id } = selected;
    setResults({
      ...results,
      [url]: {
        ...results[url],
        loading: true,
      },
    });
    decrypt().then((result) => {
      const siteResults = results[url].results;
      siteResults[id] = result;
      setResults({
        ...results,
        [url]: {
          loading: false,
          results: siteResults,
        },
      });
    });
  };

  // Copy to clipboard
  const onCopy = (field: string): void => {
    const copy = (value: string): void => {
      navigator.clipboard.writeText(value).then(() => {
        const clearClipboard = (): void => {
          navigator.clipboard.writeText('');
        };
        setTimeout(clearClipboard, 10000);
      });
    };

    const { url, id } = selected;
    const result = results[url].results[id];
    if (result.ssTemplate.STRUCTURE[field].encrypted) {
      decrypt().then(({ ssObject }) => {
        copy(ssObject.crypted[field]);
      });
    } else {
      copy(result.ssObject.public[field]);
    }
  };


  // Fill fields on page.
  const onFill = (): void => {
    const fill = (ssObject: StoredSafeObject): void => {
      browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
        const tab = tabs[0];
        const values = {
          ...ssObject.crypted,
          ...ssObject.public,
        };
        browser.tabs.sendMessage(tab.id, {
          type: 'fill',
          data: values,
        }).then(() => {
          window.close();
        });
      });
    };

    const { url, id } = selected;
    const result = results[url].results[id];
    const hasCrypted = Object.keys(result.ssTemplate.STRUCTURE).reduce((encrypted, field) => {
      return encrypted || result.ssTemplate.STRUCTURE[field].encrypted;
    }, false);
    if (hasCrypted && result.ssObject.crypted === undefined) {
      decrypt().then(({ ssObject }) => {
        fill(ssObject);
      });
    } else {
      fill(result.ssObject);
    }
  };

  /**
   * Components
   * */
  const left = <Search
    needle={needle}
    onChange={setNeedle}
    onSearch={(): void => setSearching('')}
    results={results}
    onSelect={setSelected}
    selected={selected}
  />;

  const right = <ObjectView
    results={results}
    onDecrypt={onDecrypt}
    onCopy={onCopy}
    onFill={onFill}
    selected={selected}
  />;

  return (
    <PopupUI.Content
      left={left}
      right={right}
    />
  );
};

export default PopupSearch;
