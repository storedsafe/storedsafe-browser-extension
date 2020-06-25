/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../../__mocks__/browser'
import { actions, defaults } from '../Settings'

interface Dict {
  [key: string]: string | number | boolean | Dict
}

const syncSetMock = jest.fn(async () => await Promise.resolve())
const syncGetMock = jest.fn((key: string) => Promise.resolve({})) //eslint-disable-line
const managedGetMock = jest.fn((key: string) => Promise.resolve({})) //eslint-disable-line
const mockGet = (values: object): ((key: string) => Promise<Dict>) => async (
  key: string
): Promise<Dict> => {
  if (key === 'settings') {
    return await Promise.resolve({ [key]: { ...values } })
  }
  throw new Error('Invalid key')
}

global.browser.storage.sync.get = syncGetMock
global.browser.storage.sync.set = syncSetMock
global.browser.storage.managed.get = managedGetMock
const consoleError = global.console.error

/// /////////////////////////////////////////////////////////
// Start tests

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    managedGetMock.mockClear()
    syncGetMock.mockClear()
    syncSetMock.mockClear()
  })

  test('.fetch(), no settings', async () => {
    const settings = await actions.fetch()
    for (const [key, field] of settings) {
      expect(field.managed).toBe(false)
      expect(field.value).toEqual(defaults[key])
    }
  })

  test('.fetch(), with enforced value', async () => {
    managedGetMock.mockImplementationOnce(
      mockGet({
        enforced: { foo: 'bar' }
      })
    )
    const settings = await actions.fetch()
    expect(settings.get('foo').managed).toBe(true)
    expect(settings.get('foo').value).toBe('bar')
  })

  test('.fetch(), with default value', async () => {
    managedGetMock.mockImplementationOnce(
      mockGet({
        defaults: { foo: 'bar' }
      })
    )
    const settings = await actions.fetch()
    expect(settings.get('foo').managed).toBe(false)
    expect(settings.get('foo').value).toBe('bar')
  })

  test('.fetch(), with user value', async () => {
    syncGetMock.mockImplementationOnce(mockGet({ foo: 'bar' }))
    const settings = await actions.fetch()
    expect(settings.get('foo').managed).toBe(false)
    expect(settings.get('foo').value).toBe('bar')
  })

  test('.fetch(), merge', async () => {
    managedGetMock.mockImplementationOnce(
      mockGet({
        enforced: {
          enforced: 'enforced'
        },
        defaults: {
          enforced: 'defaults',
          sync: 'defaults',
          defaults: 'defaults'
        }
      })
    )
    syncGetMock.mockImplementationOnce(
      mockGet({
        enforced: 'sync',
        sync: 'sync'
      })
    )
    const settings = await actions.fetch()
    expect(settings.get('enforced').managed).toBe(true)
    expect(settings.get('enforced').value).toBe('enforced')
    expect(settings.get('defaults').managed).toBe(false)
    expect(settings.get('defaults').value).toBe('defaults')
    expect(settings.get('sync').managed).toBe(false)
    expect(settings.get('sync').value).toBe('sync')
  })

  test('update()', async () => {
    syncGetMock.mockImplementationOnce(mockGet({}))
    const newSettings: Settings = new Map([])
    await actions.update(newSettings)
    expect(syncSetMock).toHaveBeenCalledWith({
      settings: defaults
    })
  })

  test('update(), with settings', async () => {
    const newSettings: Settings = new Map([
      [
        'foo',
        {
          managed: false,
          value: 'bar'
        }
      ]
    ])
    syncGetMock.mockImplementationOnce(mockGet({}))
    await actions.update(newSettings)
    expect(syncSetMock).toHaveBeenCalledWith({
      settings: {
        ...defaults,
        foo: 'bar'
      }
    })
  })

  test('update(), skip managed', async () => {
    const newSettings: Settings = new Map([
      [
        'foo',
        {
          managed: true,
          value: 'bar'
        }
      ]
    ])
    managedGetMock.mockImplementation(mockGet({}))
    syncGetMock.mockImplementation(mockGet({}))
    const settings = await actions.update(newSettings)
    expect(syncSetMock).toHaveBeenCalledWith({
      settings: defaults
    })
    for (const [key, field] of settings) {
      expect(field.managed).toBe(false)
      expect(field.value).toEqual(defaults[key])
    }
  })

  test('update(), skip managed, add unmanaged', async () => {
    const newSettings: Settings = new Map([
      [
        'foo',
        {
          managed: true,
          value: 'bar'
        }
      ],
      [
        'zot',
        {
          managed: false,
          value: 'foo'
        }
      ]
    ])
    managedGetMock.mockImplementation(mockGet({}))
    syncGetMock.mockImplementationOnce(mockGet({}))
    syncGetMock.mockImplementationOnce(
      mockGet({
        ...defaults,
        zot: 'foo'
      })
    )
    const settings = await actions.update(newSettings)
    expect(syncSetMock).toHaveBeenCalledWith({
      settings: {
        ...defaults,
        zot: 'foo'
      }
    })
    expect(settings.get('zot').value).toEqual('foo')
    expect(settings.get('zot').managed).toEqual(false)
    Object.keys(defaults).forEach(key => {
      expect(settings.get(key).managed).toBe(false)
      expect(settings.get(key).value).toEqual(defaults[key])
    })
  })

  test('fetch(), storage unavailable', async () => {
    syncGetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    global.console.error = jest.fn()
    const preferences = await actions.fetch()
    expect(global.console.error).toHaveBeenCalledTimes(1)
    expect(preferences).toEqual(new Map())
    global.console.error = consoleError
  })

  test('update(), storage unavailable', async () => {
    syncGetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    syncSetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    global.console.error = jest.fn()
    await actions.update(new Map())
    expect(global.console.error).toHaveBeenCalledTimes(2)
    global.console.error = consoleError
  })
})
