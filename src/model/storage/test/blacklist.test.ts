/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../../__mocks__/browser'
import { actions } from '../Blacklist'

const syncSetMock = jest.fn(async () => await Promise.resolve())
// eslint-disable-next-line
const syncGetMock = jest.fn(async (key: string) => await Promise.resolve({}))
function mockGet (blacklist: Blacklist): (key: string) => Promise<object> {
  return async (key: string): Promise<object> => {
    if (key === 'blacklist') {
      return await Promise.resolve({ [key]: blacklist })
    }
    throw new Error('Invalid key')
  }
}

global.browser.storage.sync.get = syncGetMock
global.browser.storage.sync.set = syncSetMock
const consoleError = global.console.error

/// /////////////////////////////////////////////////////////
// Start tests

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    syncSetMock.mockClear()
    syncGetMock.mockClear()
  })

  test('fetch(), empty', async () => {
    const blacklist = await actions.fetch()
    expect(blacklist.length).toBe(0)
  })

  test('fetch(), no data', async () => {
    syncGetMock.mockImplementationOnce(mockGet([]))
    const blacklist = await actions.fetch()
    expect(blacklist.length).toBe(0)
  })

  test('fetch(), with data', async () => {
    const mockBlacklist: Blacklist = [
      'foo.example.com',
      'bar.example.com',
      'zot.example.com'
    ]
    syncGetMock.mockImplementationOnce(mockGet(mockBlacklist))
    const blacklist = await actions.fetch()
    expect(blacklist).toEqual(mockBlacklist)
  })

  test('add()', async () => {
    const mockBlacklist: Blacklist = ['bar.example.com', 'zot.example.com']
    const host = 'foo.example.com'
    const newBlacklist: Blacklist = [...mockBlacklist, host]
    syncGetMock.mockImplementationOnce(mockGet(mockBlacklist))
    syncGetMock.mockImplementationOnce(mockGet(newBlacklist))
    const blacklist = await actions.add(host)
    expect(syncSetMock).toHaveBeenCalledWith({ blacklist: newBlacklist })
    expect(blacklist).toEqual(newBlacklist)
  })

  test('add(), already contains host', async () => {
    const mockBlacklist: Blacklist = ['bar.example.com', 'foo.example.com']
    const host = 'foo.example.com'
    syncGetMock.mockImplementation(mockGet(mockBlacklist))
    const blacklist = await actions.add(host)
    expect(syncSetMock).not.toHaveBeenCalled()
    expect(blacklist).toEqual(mockBlacklist)
  })

  test('remove()', async () => {
    const mockBlacklist: Blacklist = [
      'foo.example.com',
      'bar.example.com',
      'zot.example.com'
    ]
    const host = 'foo.example.com'
    const newBlacklist: Blacklist = ['bar.example.com', 'zot.example.com']
    syncGetMock.mockImplementationOnce(mockGet(mockBlacklist))
    syncGetMock.mockImplementationOnce(mockGet(newBlacklist))
    const blacklist = await actions.remove(host)
    expect(syncSetMock).toHaveBeenCalledWith({
      blacklist: newBlacklist
    })
    expect(blacklist).toEqual(newBlacklist)
  })

  test('clear()', async () => {
    syncGetMock.mockImplementationOnce(mockGet([]))
    const blacklist = await actions.clear()
    expect(blacklist).toEqual([])
  })

  test('fetch(), storage unavailable', async () => {
    syncGetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    global.console.error = jest.fn()
    const blacklist = await actions.fetch()
    expect(global.console.error).toHaveBeenCalledTimes(1)
    expect(blacklist).toEqual([])
    global.console.error = consoleError
  })

  test('add(), storage unavailable', async () => {
    syncGetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    syncSetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    global.console.error = jest.fn()
    await actions.add('host')
    expect(global.console.error).toHaveBeenCalledTimes(2)
    global.console.error = consoleError
  })
})
