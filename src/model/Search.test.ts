const localSetMock = jest.fn(() => Promise.resolve());
//eslint-disable-next-line
const localGetMock = jest.fn((key: string) => Promise.resolve({}));
const mockGet = (
  values: object
): (key: string) => Promise<object> => (key: string): Promise<object> => {
  if (key === 'search') {
    return Promise.resolve({ [key]: values });
  }
  throw new Error('Invalid key');
};

global.browser = {
  storage: {
    local:  {
      get: localGetMock,
      set: localSetMock,
    },
  }
};

import * as Search from './Search';

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    localSetMock.mockClear();
    localGetMock.mockClear();
  });

  test('fetch(), empty', () => (
    Search.actions.fetch().then((search) => {
      expect(Object.keys(search).length).toBe(0);
    })
  ));

  test('fetch(), incomplete search object', () => {
    localGetMock.mockImplementationOnce(mockGet({}));
    return Search.actions.fetch().then((search) => {
      expect(Object.keys(search).length).toBe(0);
    })
  });

  test('fetch(), values exist', () => {
    const mockSearch: Search.Search = {
      1: {
        'fetch.example.com': {
          '1234': {
            name: 'Result',
            type: 'result',
            icon: 'ico_result',
            isDecrypted: false,
            fields: {
              'field': {
                title: 'Field',
                value: 'field',
                isEncrypted: false,
                isShowing: false,
                isPassword: false,
              },
            },
          },
        },
      },
    };
    localGetMock.mockImplementationOnce(mockGet(mockSearch));
    return Search.actions.fetch().then((search) => {
      expect(search).toBe(mockSearch);
    })
  });

  test('setTabResults()', () => {
    const tabId = 2;
    const searchResults: Search.SearchResults = {
      'set.example.com': {
        '7890': {
          name: 'Result',
          type: 'result',
          icon: 'ico_result',
          isDecrypted: false,
          fields: {
            'field': {
              title: 'Field',
              value: 'field',
              isEncrypted: false,
              isShowing: false,
              isPassword: false,
            },
          },
        },
      },
    };
    const newSearch: Search.Search = {
      [tabId]: searchResults,
    };
    localGetMock.mockImplementationOnce(mockGet({}));
    localGetMock.mockImplementationOnce(mockGet(newSearch));
    return Search.actions.setTabResults(
      tabId,
      searchResults,
    ).then((search) => {
      expect(localSetMock).toHaveBeenCalledWith({
        search: newSearch
      });
      expect(search).toEqual(newSearch);
    })
  });

  test('clear()', () => {
    return Search.actions.clear().then((search) => {
      expect(localSetMock).toHaveBeenCalledWith({
        search: {},
      });
      expect(search).toEqual({});
    })
  });
});
