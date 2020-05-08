const syncSetMock = jest.fn(() => Promise.resolve());
const syncGetMock = jest.fn((key: string) => Promise.resolve({})); //eslint-disable-line
const managedGetMock = jest.fn((key: string) => Promise.resolve({})); //eslint-disable-line
const mockGet = (
  values: object
): (key: string) => Promise<object> => (key: string): Promise<object> => {
  if (key === 'sites') {
    return Promise.resolve({ [key]: values });
  }
  throw new Error('Invalid key');
};

global.browser = {
  storage: {
    sync:  {
      get: syncGetMock,
      set: syncSetMock,
    },
    managed: { get: managedGetMock },
  }
};

import * as Sites from './Sites';

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    managedGetMock.mockClear();
    syncGetMock.mockClear();
    syncSetMock.mockClear();
  });

  test('fetch(), empty', () => (
    Sites.actions.fetch().then((sites) => {
      expect(sites.collections.system.length).toBe(0);
      expect(sites.collections.user.length).toBe(0);
    })
  ));

  test('fetch(), system sites', () => {
    const mockSites = [
      {
        url: 'foo.example.com',
        apikey: 'mockapikey'
      }
    ];
    managedGetMock.mockImplementationOnce(mockGet(mockSites));
    return Sites.actions.fetch().then((sites) => {
      expect(sites.collections.system).toBe(mockSites);
      expect(sites.collections.user.length).toBe(0);
    });
  });

  test('fetch(), user sites', () => {
    const mockSites = [ { url: 'foo.example.com', apikey: 'mockapikey' } ];
    syncGetMock.mockImplementationOnce(mockGet(mockSites));
    return Sites.actions.fetch().then((sites) => {
      expect(sites.collections.system.length).toBe(0);
      expect(sites.collections.user).toBe(mockSites);
    });
  });

  test('fetch(), both', () => {
    const managedSites = [
      {
        url: 'managed.example.com',
        apikey: 'managedapikey'
      }
    ];
    const syncSites = [
      {
        url: 'sync.example.com',
        apikey: 'syncapikey'
      }
    ];
    managedGetMock.mockImplementationOnce(mockGet(managedSites));
    syncGetMock.mockImplementationOnce(mockGet(syncSites));
    return Sites.actions.fetch().then((sites) => {
      expect(sites.collections.system).toBe(managedSites);
      expect(sites.collections.user).toBe(syncSites);
    });
  });

  test('add()', () => {
    const syncSites = [
      {
        url: 'sync.example.com',
        apikey: 'syncapikey'
      }
    ];
    const site: Sites.Site = {
      url: 'foo.example.com',
      apikey: 'fooapikey'
    };
    const newSites = [
      ...syncSites,
      site,
    ];
    syncGetMock.mockImplementationOnce(mockGet(syncSites));
    syncGetMock.mockImplementationOnce(mockGet(newSites));
    return Sites.actions.add(site).then((sites) => {
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
        url: 'foo.example.com',
        apikey: 'fooapikey'
      },
      {
        url: 'bar.example.com',
        apikey: 'barapikey'
      },
      {
        url: 'zot.example.com',
        apikey: 'zotapikey'
      }
    ];
    const updatedSites = [syncSites[0], syncSites[2]];
    syncGetMock.mockImplementationOnce(mockGet(syncSites));
    syncGetMock.mockImplementationOnce(mockGet(updatedSites));
    return Sites.actions.remove(1).then((sites) => {
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
