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

  test('get(), empty', () => (
    Sites.get().then((sites) => {
      expect(sites.system.length).toBe(0);
      expect(sites.user.length).toBe(0);
    })
  ));

  test('get(), system sites', () => {
    const mockSites = [ { url: 'foo.example.com', apikey: 'mockapikey' } ];
    managedGetMock.mockImplementationOnce(mockGet(mockSites));
    return Sites.get().then((sites) => {
      expect(sites.system).toBe(mockSites);
      expect(sites.user.length).toBe(0);
    });
  });

  test('get(), user sites', () => {
    const mockSites = [ { url: 'foo.example.com', apikey: 'mockapikey' } ];
    syncGetMock.mockImplementationOnce(mockGet(mockSites));
    return Sites.get().then((sites) => {
      expect(sites.system.length).toBe(0);
      expect(sites.user).toBe(mockSites);
    });
  });

  test('get(), both', () => {
    const managedSites = [ { url: 'managed.example.com', apikey: 'managedapikey' } ];
    const syncSites = [ { url: 'sync.example.com', apikey: 'syncapikey' } ];
    managedGetMock.mockImplementationOnce(mockGet(managedSites));
    syncGetMock.mockImplementationOnce(mockGet(syncSites));
    return Sites.get().then((sites) => {
      expect(sites.system).toBe(managedSites);
      expect(sites.user).toBe(syncSites);
    });
  });

  test('set(), empty', () => {
    return Sites.set({
      system: [], user: [],
    }).then(() => {
      expect(syncSetMock).toHaveBeenCalledWith({ sites: [] });
    });
  });

  test('set(), system sites', () => {
    return Sites.set({
      system:  [{ url: 'foo.example.com', apikey: 'mockapikey' }], user: [],
    }).then(() => {
      expect(syncSetMock).toHaveBeenCalledWith({ sites: [] });
    });
  });

  test('set(), user sites', () => {
    const mockSites = [{ url: 'foo.example.com', apikey: 'mockapikey' }];
    return Sites.set({
      system:  [], user: mockSites,
    }).then(() => {
      expect(syncSetMock).toHaveBeenCalledWith({ sites: mockSites });
    });
  });

  test('set(), both', () => {
    const managedSites = [ { url: 'managed.example.com', apikey: 'managedapikey' } ];
    const syncSites = [ { url: 'sync.example.com', apikey: 'syncapikey' } ];
    return Sites.set({
      system:  managedSites, user: syncSites,
    }).then(() => {
      expect(syncSetMock).toHaveBeenCalledWith({ sites: syncSites });
    });
  });
});
