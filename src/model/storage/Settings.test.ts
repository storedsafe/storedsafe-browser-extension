/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../__mocks__/browser'

/// /////////////////////////////////////////////////////////
// Start tests

import { actions, defaults } from './Settings'
interface Dict {
  [key: string]: string | number | boolean | Dict
}

const syncSetMock = jest.fn(() => Promise.resolve())
const syncGetMock = jest.fn((key: string) => Promise.resolve({})); //eslint-disable-line
const managedGetMock = jest.fn((key: string) => Promise.resolve({})); //eslint-disable-line
const mockGet = (
  values: object
): (key: string) => Promise<Dict> => (key: string): Promise<Dict> => {
  if (key === 'settings') {
    return Promise.resolve({ [key]: { ...values } })
  }
  throw new Error('Invalid key')
}

global.browser.storage.sync.get = syncGetMock
global.browser.storage.sync.set = syncSetMock
global.browser.storage.managed.get = managedGetMock

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    managedGetMock.mockClear()
    syncGetMock.mockClear()
    syncSetMock.mockClear()
  })

  test('.fetch(), no settings', () => (
    actions.fetch().then((settings) => {
      for (const [key, field] of settings) {
        expect(field.managed).toBe(false)
        expect(field.value).toEqual(defaults[key])
      }
    })
  ))

  test('.fetch(), with enforced value', () => {
    managedGetMock.mockImplementationOnce(mockGet({
      enforced: { foo: 'bar' }
    }))
    return actions.fetch().then((settings) => {
      expect(settings.get('foo').managed).toBe(true)
      expect(settings.get('foo').value).toBe('bar')
    })
  })

  test('.fetch(), with default value', () => {
    managedGetMock.mockImplementationOnce(mockGet({
      defaults: { foo: 'bar' }
    }))
    return actions.fetch().then((settings) => {
      expect(settings.get('foo').managed).toBe(false)
      expect(settings.get('foo').value).toBe('bar')
    })
  })

  test('.fetch(), with user value', () => {
    syncGetMock.mockImplementationOnce(mockGet({ foo: 'bar' }))
    return actions.fetch().then((settings) => {
      expect(settings.get('foo').managed).toBe(false)
      expect(settings.get('foo').value).toBe('bar')
    })
  })

  test('.fetch(), merge', () => {
    managedGetMock.mockImplementationOnce(mockGet({
      enforced: {
        enforced: 'enforced'
      },
      defaults: {
        enforced: 'defaults',
        sync: 'defaults',
        defaults: 'defaults'
      }
    }))
    syncGetMock.mockImplementationOnce(mockGet({
      enforced: 'sync',
      sync: 'sync'
    }))
    return actions.fetch().then((settings) => {
      expect(settings.get('enforced').managed).toBe(true)
      expect(settings.get('enforced').value).toBe('enforced')
      expect(settings.get('defaults').managed).toBe(false)
      expect(settings.get('defaults').value).toBe('defaults')
      expect(settings.get('sync').managed).toBe(false)
      expect(settings.get('sync').value).toBe('sync')
    })
  })

  test('update()', () => {
    syncGetMock.mockImplementationOnce(mockGet({}))
    const settings: Settings = new Map([])
    return actions.update(settings).then(() => {
      expect(syncSetMock).toHaveBeenCalledWith({
        settings: defaults
      })
    })
  })

  test('update(), with settings', () => {
    const settings: Settings = new Map([
      ['foo', {
        managed: false,
        value: 'bar'
      }]
    ])
    syncGetMock.mockImplementationOnce(mockGet({}))
    return actions.update(settings).then(() => {
      expect(syncSetMock).toHaveBeenCalledWith({
        settings: {
          ...defaults,
          foo: 'bar'
        }
      })
    })
  })

  test('update(), skip managed', () => {
    const newSettings: Settings = new Map([
      ['foo', {
        managed: true,
        value: 'bar'
      }]
    ])
    managedGetMock.mockImplementation(mockGet({}))
    syncGetMock.mockImplementation(mockGet({}))
    return actions.update(newSettings).then((settings) => {
      expect(syncSetMock).toHaveBeenCalledWith({
        settings: defaults
      })
      Object.keys(defaults).forEach((key) => {
        expect(settings.get(key).managed).toBe(false)
        expect(settings.get(key).value).toEqual(defaults[key])
      })
    })
  })

  test('update(), skip managed, add unmanaged', () => {
    const newSettings: Settings = new Map([
      ['foo', {
        managed: true,
        value: 'bar'
      }],
      ['zot', {
        managed: false,
        value: 'foo'
      }]
    ])
    managedGetMock.mockImplementation(mockGet({}))
    syncGetMock.mockImplementationOnce(mockGet({}))
    syncGetMock.mockImplementationOnce(mockGet({
      ...defaults,
      zot: 'foo'
    }))
    return actions.update(newSettings).then((settings) => {
      expect(syncSetMock).toHaveBeenCalledWith({
        settings: {
          ...defaults,
          zot: 'foo'
        }
      })
      expect(settings.get('zot').value).toEqual('foo')
      expect(settings.get('zot').managed).toEqual(false)
      Object.keys(defaults).forEach((key) => {
        expect(settings.get(key).managed).toBe(false)
        expect(settings.get(key).value).toEqual(defaults[key])
      })
    })
  })
})
