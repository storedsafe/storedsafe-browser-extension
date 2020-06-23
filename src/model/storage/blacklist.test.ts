/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../__mocks__/browser'

/// /////////////////////////////////////////////////////////
// Start tests

import { actions } from './Blacklist'
const syncSetMock = jest.fn(async () => await Promise.resolve())
// eslint-disable-next-line
const syncGetMock = jest.fn(async (key: string) => await Promise.resolve({}));
function mockGet (
  blacklist: Blacklist
): (key: string) => Promise<object> {
  return async (key: string): Promise<object> => {
    if (key === 'blacklist') {
      return await Promise.resolve({ [key]: blacklist })
    }
    throw new Error('Invalid key')
  }
}

global.browser.storage.sync.get = syncGetMock
global.browser.storage.sync.set = syncSetMock

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    syncSetMock.mockClear()
    syncGetMock.mockClear()
  })

  test('fetch(), empty', async () => (
    await actions.fetch().then((blacklist) => {
      expect(blacklist.length).toBe(0)
    })
  ))

  test('fetch(), no data', async () => {
    syncGetMock.mockImplementationOnce(mockGet([]))
    return await actions.fetch().then((blacklist) => {
      expect(blacklist.length).toBe(0)
    })
  })

  test('fetch(), with data', async () => {
    const mockBlacklist: Blacklist = [
      'foo.example.com',
      'bar.example.com',
      'zot.example.com'
    ]
    syncGetMock.mockImplementationOnce(mockGet(mockBlacklist))
    return await actions.fetch().then((blacklist) => {
      expect(blacklist).toEqual(mockBlacklist)
    })
  })

  test('add()', async () => {
    const mockBlacklist: Blacklist = [
      'bar.example.com',
      'zot.example.com'
    ]
    const host = 'foo.example.com'
    const newBlacklist: Blacklist = [
      ...mockBlacklist,
      host
    ]
    syncGetMock.mockImplementationOnce(mockGet(mockBlacklist))
    syncGetMock.mockImplementationOnce(mockGet(newBlacklist))
    return await actions.add(host).then((blacklist) => {
      expect(syncSetMock).toHaveBeenCalledWith({
        blacklist: newBlacklist
      })
      expect(blacklist).toEqual(newBlacklist)
    })
  })

  test('remove()', async () => {
    const mockBlacklist: Blacklist = [
      'foo.example.com',
      'bar.example.com',
      'zot.example.com'
    ]
    const host = 'foo.example.com'
    const newBlacklist: Blacklist = [
      'bar.example.com',
      'zot.example.com'
    ]
    syncGetMock.mockImplementationOnce(mockGet(mockBlacklist))
    syncGetMock.mockImplementationOnce(mockGet(newBlacklist))
    return await actions.remove(host).then((blacklist) => {
      expect(syncSetMock).toHaveBeenCalledWith({
        blacklist: newBlacklist
      })
      expect(blacklist).toEqual(newBlacklist)
    })
  })
})
