/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../../__mocks__/browser'
import { actions } from '../Sites'

const syncSetMock = jest.fn(async () => await Promise.resolve())
const syncGetMock = jest.fn(async (key: string) => await Promise.resolve({}))
const managedGetMock = jest.fn(async (key: string) => await Promise.resolve({}))
const mockGet = (sites: Site[]): ((key: string) => Promise<object>) => async (
  key: string
): Promise<object> => {
  if (key === 'sites') {
    return await Promise.resolve({ [key]: sites })
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

  test('fetch(), empty', async () => {
    const sites = await actions.fetch()
    expect(sites.collections.system.length).toBe(0)
    expect(sites.collections.user.length).toBe(0)
  })

  test('fetch(), system sites', async () => {
    const mockSites = [
      {
        host: 'foo.example.com',
        apikey: 'mockapikey'
      }
    ]
    managedGetMock.mockImplementationOnce(mockGet(mockSites))
    const sites = await actions.fetch()
    expect(sites.collections.system).toBe(mockSites)
    expect(sites.collections.user.length).toBe(0)
  })

  test('fetch(), user sites', async () => {
    const mockSites = [{ host: 'foo.example.com', apikey: 'mockapikey' }]
    syncGetMock.mockImplementationOnce(mockGet(mockSites))
    const sites = await actions.fetch()
    expect(sites.collections.system.length).toBe(0)
    expect(sites.collections.user).toBe(mockSites)
  })

  test('fetch(), both', async () => {
    const managedSites = [
      {
        host: 'managed.example.com',
        apikey: 'managedapikey'
      }
    ]
    const syncSites = [
      {
        host: 'sync.example.com',
        apikey: 'syncapikey'
      }
    ]
    managedGetMock.mockImplementationOnce(mockGet(managedSites))
    syncGetMock.mockImplementationOnce(mockGet(syncSites))
    const sites = await actions.fetch()
    expect(sites.collections.system).toBe(managedSites)
    expect(sites.collections.user).toBe(syncSites)
  })

  test('add()', async () => {
    const syncSites = [
      {
        host: 'sync.example.com',
        apikey: 'syncapikey'
      }
    ]
    const site: Site = {
      host: 'foo.example.com',
      apikey: 'fooapikey'
    }
    const newSites = [...syncSites, site]
    syncGetMock.mockImplementationOnce(mockGet(syncSites))
    syncGetMock.mockImplementationOnce(mockGet(newSites))
    const sites = await actions.add(site)
    expect(syncSetMock).toHaveBeenCalledWith({
      sites: newSites
    })
    expect(sites).toEqual({
      list: newSites,
      collections: {
        system: [],
        user: newSites
      }
    })
  })

  test('remove()', async () => {
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
    ]
    const updatedSites = [syncSites[0], syncSites[2]]
    syncGetMock.mockImplementationOnce(mockGet(syncSites))
    syncGetMock.mockImplementationOnce(mockGet(updatedSites))
    const sites = await actions.remove(1)
    expect(syncSetMock).toHaveBeenCalledWith({
      sites: updatedSites
    })
    expect(sites).toEqual({
      list: updatedSites,
      collections: {
        system: [],
        user: updatedSites
      }
    })
  })

  test('fetch(), storage unavailable', async () => {
    syncGetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    global.console.error = jest.fn()
    const preferences = await actions.fetch()
    expect(global.console.error).toHaveBeenCalledTimes(1)
    expect(preferences).toEqual({ collections: { system: [], user: [] }, list: [] })
    global.console.error = consoleError
  })

  test('add(), storage unavailable', async () => {
    const site: Site = {
      host: 'host',
      apikey: 'apikey'
    }
    syncGetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    syncSetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    global.console.error = jest.fn()
    await actions.add(site)
    expect(global.console.error).toHaveBeenCalledTimes(2)
    global.console.error = consoleError
  })
})
