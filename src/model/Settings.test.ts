import '../__mocks__/browser';
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

global.browser.storage.sync.get = syncGetMock;
global.browser.storage.sync.set = syncSetMock;
global.browser.storage.managed.get = managedGetMock;

import * as Settings from './Settings';

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    managedGetMock.mockClear();
    syncGetMock.mockClear();
    syncSetMock.mockClear();
  });

  test('.fetch(), no settings', () => (
    Settings.actions.fetch().then((settings) => {
      Object.keys(settings).forEach((key) => {
        expect(settings[key].managed).toBe(false);
        expect(settings[key].value).toEqual(Settings.defaults[key]);
      });
    })
  ));

  test('.fetch(), with enforced value', () => {
    managedGetMock.mockImplementationOnce(mockGet({
      enforced: { foo: 'bar' }
    }));
    return Settings.actions.fetch().then((settings) => {
      expect(settings.foo.managed).toBe(true);
      expect(settings.foo.value).toBe('bar');
    })
  });

  test('.fetch(), with default value', () => {
    managedGetMock.mockImplementationOnce(mockGet({
      defaults: { foo: 'bar' }
    }));
    return Settings.actions.fetch().then((settings) => {
      expect(settings.foo.managed).toBe(false);
      expect(settings.foo.value).toBe('bar');
    })
  });

  test('.fetch(), with user value', () => {
    syncGetMock.mockImplementationOnce(mockGet({ foo: 'bar' }));
    return Settings.actions.fetch().then((settings) => {
      expect(settings.foo.managed).toBe(false);
      expect(settings.foo.value).toBe('bar');
    });
  });

  test('.fetch(), merge', () => {
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
    return Settings.actions.fetch().then((settings) => {
      expect(settings.enforced.managed).toBe(true);
      expect(settings.enforced.value).toBe('enforced');
      expect(settings.defaults.managed).toBe(false);
      expect(settings.defaults.value).toBe('defaults');
      expect(settings.sync.managed).toBe(false);
      expect(settings.sync.value).toBe('sync');
    });
  });

  test('update()', () => {
    syncGetMock.mockImplementationOnce(mockGet({}));
    const settings: Settings.Settings = {}
    return Settings.actions.update(settings).then(() => {
      expect(syncSetMock).toHaveBeenCalledWith({
        settings: Settings.defaults,
      });
    });
  });

  test('update(), with settings', () => {
    const settings: Settings.Settings = {
      foo: {
        managed: false,
        value: 'bar',
      },
    };
    syncGetMock.mockImplementationOnce(mockGet({}));
    return Settings.actions.update(settings).then(() => {
      expect(syncSetMock).toHaveBeenCalledWith({
        settings: {
          ...Settings.defaults,
          foo: 'bar'
        },
      });
    });
  });

  test('update(), skip managed', () => {
    const newSettings: Settings.Settings = {
      foo: {
        managed: true,
        value: 'bar',
      },
    };
    managedGetMock.mockImplementation(mockGet({}));
    syncGetMock.mockImplementation(mockGet({}));
    return Settings.actions.update(newSettings).then((settings) => {
      expect(syncSetMock).toHaveBeenCalledWith({
        settings: Settings.defaults,
      });
      Object.keys(Settings.defaults).forEach((key) => {
        expect(settings[key].managed).toBe(false);
        expect(settings[key].value).toEqual(Settings.defaults[key]);
      });
    });
  });

  test('update(), skip managed, add unmanaged', () => {
    const newSettings: Settings.Settings = {
      foo: {
        managed: true,
        value: 'bar',
      },
      zot: {
        managed: false,
        value: 'foo',
      },
    }
    managedGetMock.mockImplementation(mockGet({}));
    syncGetMock.mockImplementationOnce(mockGet({}));
    syncGetMock.mockImplementationOnce(mockGet({
      ...Settings.defaults,
      zot: 'foo',
    }));
    return Settings.actions.update(newSettings).then((settings) => {
      expect(syncSetMock).toHaveBeenCalledWith({
        settings: {
          ...Settings.defaults,
          zot: 'foo'
        },
      });
      expect(settings.zot.value).toEqual('foo');
      expect(settings.zot.managed).toEqual(false);
      Object.keys(Settings.defaults).forEach((key) => {
        expect(settings[key].managed).toBe(false);
        expect(settings[key].value).toEqual(Settings.defaults[key]);
      });
    });
  });
});
