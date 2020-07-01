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

  test('fetch(), storage manifest missing', async () => {
    const mockSites = [
      {
        host: 'foo.example.com',
        apikey: 'mockapikey'
      }
    ]
    syncGetMock.mockImplementationOnce(mockGet(mockSites))
    managedGetMock.mockImplementationOnce(
      async () =>
        await Promise.reject(new Error('Managed storage manifest not found'))
    )
    const spy = jest.spyOn(global.console, 'warn').mockImplementation(() => {})
    const sites = await actions.fetch()
    expect(spy).toHaveBeenCalledWith('No managed storage manifest found.')
    expect(sites).toEqual({
      collections: { system: [], user: mockSites },
      list: mockSites
    })
    spy.mockRestore()
  })

  test('fetch(), empty error', async () => {
    const mockSites = [
      {
        host: 'foo.example.com',
        apikey: 'mockapikey'
      }
    ]
    syncGetMock.mockImplementationOnce(mockGet(mockSites))
    const mockError = new Error()
    managedGetMock.mockImplementationOnce(
      async () => await Promise.reject(mockError)
    )
    try {
      await actions.fetch()
    } catch (error) {
      expect(error).toBe(mockError)
    }
  })
})
