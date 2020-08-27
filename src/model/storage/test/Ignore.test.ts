/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../../__mocks__/browser'
import { actions } from '../Ignore'

const syncSetMock = jest.fn(async () => await Promise.resolve())
// eslint-disable-next-line
const syncGetMock = jest.fn(async (key: string) => await Promise.resolve({}))
function mockGet (ignore: Ignore): (key: string) => Promise<object> {
  return async (key: string): Promise<object> => {
    if (key === 'ignore') {
      return await Promise.resolve({ [key]: ignore })
    }
    throw new Error('Invalid key')
  }
}

global.browser.storage.sync.get = syncGetMock
global.browser.storage.sync.set = syncSetMock

/// /////////////////////////////////////////////////////////
// Start tests

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    syncSetMock.mockClear()
    syncGetMock.mockClear()
  })

  test('fetch(), empty', async () => {
    const ignore = await actions.fetch()
    expect(ignore.length).toBe(0)
  })

  test('fetch(), no data', async () => {
    syncGetMock.mockImplementationOnce(mockGet([]))
    const ignore = await actions.fetch()
    expect(ignore.length).toBe(0)
  })

  test('fetch(), with data', async () => {
    const mockIgnore: Ignore = [
      'foo.example.com',
      'bar.example.com',
      'zot.example.com'
    ]
    syncGetMock.mockImplementationOnce(mockGet(mockIgnore))
    const ignore = await actions.fetch()
    expect(ignore).toEqual(mockIgnore)
  })

  test('add()', async () => {
    const mockIgnore: Ignore = ['bar.example.com', 'zot.example.com']
    const host = 'foo.example.com'
    const newIgnore: Ignore = [...mockIgnore, host]
    syncGetMock.mockImplementationOnce(mockGet(mockIgnore))
    syncGetMock.mockImplementationOnce(mockGet(newIgnore))
    const ignore = await actions.add(host)
    expect(syncSetMock).toHaveBeenCalledWith({ ignore: newIgnore })
    expect(ignore).toEqual(newIgnore)
  })

  test('add(), already contains host', async () => {
    const mockIgnore: Ignore = ['bar.example.com', 'foo.example.com']
    const host = 'foo.example.com'
    syncGetMock.mockImplementation(mockGet(mockIgnore))
    const ignore = await actions.add(host)
    expect(syncSetMock).not.toHaveBeenCalled()
    expect(ignore).toEqual(mockIgnore)
  })

  test('remove()', async () => {
    const mockIgnore: Ignore = [
      'foo.example.com',
      'bar.example.com',
      'zot.example.com'
    ]
    const host = 'foo.example.com'
    const newIgnore: Ignore = ['bar.example.com', 'zot.example.com']
    syncGetMock.mockImplementationOnce(mockGet(mockIgnore))
    syncGetMock.mockImplementationOnce(mockGet(newIgnore))
    const ignore = await actions.remove(host)
    expect(syncSetMock).toHaveBeenCalledWith({
      ignore: newIgnore
    })
    expect(ignore).toEqual(newIgnore)
  })

  test('clear()', async () => {
    syncGetMock.mockImplementationOnce(mockGet([]))
    const ignore = await actions.clear()
    expect(ignore).toEqual([])
  })

  test('fetch(), storage unavailable', async () => {
    syncGetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    await expect(actions.fetch()).rejects.toThrowError()
  })

  test('add(), storage unavailable', async () => {
    syncGetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    syncSetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    await expect(actions.add('host')).rejects.toThrowError()
  })
})
