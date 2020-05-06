const localSetMock = jest.fn(() => Promise.resolve());
//eslint-disable-next-line
const localGetMock = jest.fn((key: string) => Promise.resolve({}));
const mockGet = (
  values: object
): (key: string) => Promise<object> => (key: string): Promise<object> => {
  if (key === 'sitePrefs') {
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

import * as SitePrefs from './SitePrefs';

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    localSetMock.mockClear();
    localGetMock.mockClear();
  });

  test('get(), empty', () => (
    SitePrefs.get().then((sitePrefs) => {
      expect(Object.keys(sitePrefs).length).toBe(0);
    })
  ));

  test('get(), no data', () => {
    localGetMock.mockImplementationOnce(mockGet({}));
    return SitePrefs.get().then((sitePrefs) => {
      expect(Object.keys(sitePrefs).length).toBe(0);
    });
  });

  test('get(), with data', () => {
    const mockSitePrefs: SitePrefs.SitePrefs = {
      'foo.example.com': {
        username: 'bob',
        loginType: 'yubikey',
      },
      'bar.example.com': {
        username: 'alice',
      },
      'zot.example.com': {
        loginType: 'totp',
      },
    }
    localGetMock.mockImplementationOnce(mockGet(mockSitePrefs));
    return SitePrefs.get().then((sitePrefs) => {
      expect(sitePrefs['foo.example.com']).toBe(mockSitePrefs['foo.example.com']);
      expect(sitePrefs['bar.example.com']).toBe(mockSitePrefs['bar.example.com']);
      expect(sitePrefs['zot.example.com']).toBe(mockSitePrefs['zot.example.com']);
    });
  });

  test('set()', () => {
    const mockSitePrefs: SitePrefs.SitePrefs = {
      'foo.example.com': {
        username: 'bob',
        loginType: 'yubikey',
      },
    }
    return SitePrefs.set(mockSitePrefs).then(() => {
      expect(localSetMock).toHaveBeenCalledWith({ sitePrefs: mockSitePrefs });
    });
  });
});
