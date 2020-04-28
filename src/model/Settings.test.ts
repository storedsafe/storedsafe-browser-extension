interface Dict {
  [key: string]: string | number | boolean | Dict;
}

const syncSetMock = jest.fn(() => Promise.resolve());
const syncGetMock = jest.fn((key: string) => Promise.resolve({})); //eslint-disable-line
const managedGetMock = jest.fn((key: string) => Promise.resolve({})); //eslint-disable-line
const mockGet = (
  values: Dict
): (key: string) => Promise<Dict> => (key: string): Promise<Dict> => {
  if (key === 'settings') {
    return Promise.resolve({ [key]: { ...values } });
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

import * as Settings from './Settings';

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    managedGetMock.mockClear();
    syncGetMock.mockClear();
    syncSetMock.mockClear();
  });

  test('.get(), no settings', () => (
    Settings.get().then((settings) => {
      expect(settings).toEqual(Settings.defaults);
    })
  ));

  test('.get(), with enforced value', () => {
    managedGetMock.mockImplementationOnce(mockGet({
      enforced: { foo: 'bar' }
    }));
    return Settings.get().then((settings) => {
      expect(settings.foo.managed).toBe(true);
      expect(settings.foo.value).toBe('bar');
    })
  });

  test('.get(), with default value', () => {
    managedGetMock.mockImplementationOnce(mockGet({
      defaults: { foo: 'bar' }
    }));
    return Settings.get().then((settings) => {
      expect(settings.foo.managed).toBe(false);
      expect(settings.foo.value).toBe('bar');
    })
  });

  test('.get(), with user value', () => {
    syncGetMock.mockImplementationOnce(mockGet({ foo: 'bar' }));
    return Settings.get().then((settings) => {
      expect(settings.foo.managed).toBe(false);
      expect(settings.foo.value).toBe('bar');
    });
  });

  test('.get(), merge', () => {
    managedGetMock.mockImplementationOnce(mockGet({
      enforced: {
        enforced: 'enforced',
      },
      defaults: {
        enforced: 'defaults',
        sync: 'defaults',
        defaults: 'defaults',
      }
    }));
    syncGetMock.mockImplementationOnce(mockGet({
      enforced: 'sync',
      sync: 'sync',
    }));
    return Settings.get().then((settings) => {
      expect(settings.enforced.managed).toBe(true);
      expect(settings.enforced.value).toBe('enforced');
      expect(settings.defaults.managed).toBe(false);
      expect(settings.defaults.value).toBe('defaults');
      expect(settings.sync.managed).toBe(false);
      expect(settings.sync.value).toBe('sync');
    });
  });

  test('set()', () => {
    const settings: Settings.Settings = {}
    return Settings.set(settings).then(() => {
      expect(syncSetMock).toHaveBeenCalledWith({
        settings: {}
      });
    });
  });

  test('set(), with settings', () => {
    const settings: Settings.Settings = {
      foo: {
        managed: false,
        value: 'bar',
      },
    };
    return Settings.set(settings).then(() => {
      expect(syncSetMock).toHaveBeenCalledWith({
        settings: { foo: 'bar' },
      });
    });
  });

  test('set(), skip managed', () => {
    const settings: Settings.Settings = {
      foo: {
        managed: true,
        value: 'bar',
      },
    };
    return Settings.set(settings).then(() => {
      expect(syncSetMock).toHaveBeenCalledWith({
        settings: {},
      });
    });
  });

  test('set(), skip managed, add unmanaged', () => {
    const settings: Settings.Settings = {
      foo: {
        managed: true,
        value: 'bar',
      },
      zot: {
        managed: false,
        value: 'foo',
      },
    }
    return Settings.set(settings).then(() => {
      expect(syncSetMock).toHaveBeenCalledWith({
        settings: { zot: 'foo' },
      });
    });
  });
});
