////////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../__mocks__/browser';
const syncSetMock = jest.fn(() => Promise.resolve());
const syncGetMock = jest.fn((key: string) => Promise.resolve({})); //eslint-disable-line
const managedGetMock = jest.fn((key: string) => Promise.resolve({})); //eslint-disable-line
const mockGet = (
  sites: Site[]
): (key: string) => Promise<object> => (key: string): Promise<object> => {
  if (key === 'sites') {
    return Promise.resolve({ [key]: sites });
  }
  throw new Error('Invalid key');
};

global.browser.storage.sync.get = syncGetMock;
global.browser.storage.sync.set = syncSetMock;
global.browser.storage.managed.get = managedGetMock;

////////////////////////////////////////////////////////////
// Start tests

import { actions } from './Sites';

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    managedGetMock.mockClear();
    syncGetMock.mockClear();
    syncSetMock.mockClear();
  });

  test('fetch(), empty', () => (
    actions.fetch().then((sites) => {
      expect(sites.collections.system.length).toBe(0);
      expect(sites.collections.user.length).toBe(0);
    })
  ));

  test('fetch(), system sites', () => {
    const mockSites = [
      {
        host: 'foo.example.com',
        apikey: 'mockapikey'
      }
    ];
    managedGetMock.mockImplementationOnce(mockGet(mockSites));
    return actions.fetch().then((sites) => {
      expect(sites.collections.system).toBe(mockSites);
      expect(sites.collections.user.length).toBe(0);
    });
  });

  test('fetch(), user sites', () => {
    const mockSites = [ { host: 'foo.example.com', apikey: 'mockapikey' } ];
    syncGetMock.mockImplementationOnce(mockGet(mockSites));
    return actions.fetch().then((sites) => {
      expect(sites.collections.system.length).toBe(0);
      expect(sites.collections.user).toBe(mockSites);
    });
  });

  test('fetch(), both', () => {
    const managedSites = [
      {
        host: 'managed.example.com',
        apikey: 'managedapikey'
      }
    ];
    const syncSites = [
      {
        host: 'sync.example.com',
        apikey: 'syncapikey'
      }
    ];
    managedGetMock.mockImplementationOnce(mockGet(managedSites));
    syncGetMock.mockImplementationOnce(mockGet(syncSites));
    return actions.fetch().then((sites) => {
      expect(sites.collections.system).toBe(managedSites);
      expect(sites.collections.user).toBe(syncSites);
    });
  });

  test('add()', () => {
    const syncSites = [
      {
        host: 'sync.example.com',
        apikey: 'syncapikey'
      }
    ];
    const site: Site = {
      host: 'foo.example.com',
      apikey: 'fooapikey'
    };
    const newSites = [
      ...syncSites,
      site,
    ];
    syncGetMock.mockImplementationOnce(mockGet(syncSites));
    syncGetMock.mockImplementationOnce(mockGet(newSites));
    return actions.add(site).then((sites) => {
      expect(syncSetMock).toHaveBeenCalledWith({
        sites: newSites
      });
      expect(sites).toEqual({
        list: newSites,
        collections: {
          system: [],
          user: newSites,
        },
      });
    });
  });

  test('remove()', () => {
    const syncSites = [
      {
        host: 'foo.example.com',
        apikey: 'fooapikey'
      },
      {
        host: 'bar.example.com',
        apikey: 'barapikey'
      },
      {
        host: 'zot.example.com',
        apikey: 'zotapikey'
      }
    ];
    const updatedSites = [syncSites[0], syncSites[2]];
    syncGetMock.mockImplementationOnce(mockGet(syncSites));
    syncGetMock.mockImplementationOnce(mockGet(updatedSites));
    return actions.remove(1).then((sites) => {
      expect(syncSetMock).toHaveBeenCalledWith({
        sites: updatedSites,
      });
      expect(sites).toEqual({
        list: updatedSites,
        collections: {
          system: [],
          user: updatedSites,
        }
      });
    });
  });
});
