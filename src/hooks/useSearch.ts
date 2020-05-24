import { useState } from 'react';
import { SearchResults, SearchResult} from '../model/Search';
import { actions } from '../model/StoredSafe';

interface DecryptedFields {
  [url: string]: {
    [id: number]: string[];
  };
};

interface SearchHook {
  results: SearchResults;
  decrypted: DecryptedFields;
  search: (needle: string) => void;
  decrypt: (url: string, objectId: string, field: string) => void;
}

const useSearch = (): SearchHook => {
  const [results, setResults] = useState<SearchResults>({});
  const [decrypted, setDecrypted] = useState<DecryptedFields>({});

  const search = (needle: string) => {
    actions.find(needle).then((promises) => {
      const loadingResults: SearchResults = {};
      Object.keys(promises).forEach((url) => {
        loadingResults[url] = { loading: true, results: [] };
      });
      setResults(loadingResults);
      Object.keys(promises).forEach((url) => {
        promises[url].then((siteResults) => {
          setResults((prevResults) => ({
            ...prevResults,
            [url]: { loading: false, results: siteResults },
          }));
        });
      });
    });
  };

  const decrypt = (
    url: string,
    objectId: string,
    field: string
  ): void => {
    const id = results[url].results.findIndex((result) => result.ssObject.id === objectId);
    if (results[url].results[id].decryptedFields.length > 0)  {
      setResults((prevResults) => ({
        ...prevResults,
        [url]: {
          loading: false,
          results: {

          },
        },
      }));
    }
    actions.decrypt(url, objectId).then((decryptedObject) => {
      setResults((prevResults) => {
        const siteResults = prevResults[url].results.map((result) => {
          if (result.ssObject.id === objectId) {
            return {
              ssObject: decryptedObject,
              ssTemplate: result.ssTemplate,
              decryptedFields: [field],
            };
          }
          return result;
        });

        return {
          ...prevResults,
          [url]: {
            loading: false,
            results: siteResults
          },
        };
      });
    });
  };

  return {
    results,
    decrypted,
    search,
    decrypt,
  };
};
