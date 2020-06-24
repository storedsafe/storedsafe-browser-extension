/// /////////////////////////////////////////////////////////
// Set up mocks for browser storage API.

import '../../__mocks__/browser'
import { actions } from './TabResults'

const localSetMock = jest.fn(async () => await Promise.resolve())
const localGetMock = jest.fn(async (key: string) => await Promise.resolve({}))
const mockGet = (
  serializableTabresults: SerializableTabResults
): ((key: string) => Promise<object>) => async (
  key: string
): Promise<object> => {
  if (key === 'tabResults') {
    return await Promise.resolve({ [key]: serializableTabresults })
  }
  throw new Error('Invalid key')
}

global.browser.storage.local.get = localGetMock
global.browser.storage.local.set = localSetMock
const consoleError = global.console.error

/// /////////////////////////////////////////////////////////
// Start tests

describe('uses mocked browser.storage', () => {
  beforeEach(() => {
    localSetMock.mockClear()
    localGetMock.mockClear()
  })

  test('fetch(), empty', async () => {
    const tabResults = await actions.fetch()
    expect(tabResults.size).toBe(0)
  })

  test('fetch(), incomplete object', async () => {
    localGetMock.mockImplementationOnce(mockGet([]))
    const tabResults = await actions.fetch()
    expect(tabResults.size).toBe(0)
  })

  test('fetch(), values exist', async () => {
    const mockTabResults: SerializableTabResults = [
      [
        1,
        [
          [
            'fetch.example.com',
            [
              {
                id: '1234',
                templateId: '4',
                vaultId: '5',
                name: 'Result',
                type: 'result',
                icon: 'ico_result',
                isDecrypted: false,
                fields: [
                  {
                    name: 'field',
                    title: 'Field',
                    value: 'field',
                    isEncrypted: false,
                    isShowing: false,
                    isPassword: false
                  }
                ]
              }
            ]
          ]
        ]
      ]
    ]
    const parsedMockTabResults = new Map(
      mockTabResults.map(([k, v]) => [k, new Map(v)])
    )
    localGetMock.mockImplementationOnce(mockGet(mockTabResults))
    const tabResults = await actions.fetch()
    expect(tabResults).toEqual(parsedMockTabResults)
  })

  test('setTabResults()', async () => {
    const tabId = 2
    const results: SerializableResults = [
      [
        'set.example.com',
        [
          {
            id: '7890',
            templateId: '4',
            vaultId: '5',
            name: 'Result',
            type: 'result',
            icon: 'ico_result',
            isDecrypted: false,
            fields: [
              {
                name: 'field',
                title: 'Field',
                value: 'field',
                isEncrypted: false,
                isShowing: false,
                isPassword: false
              }
            ]
          }
        ]
      ]
    ]
    const newTabResults: SerializableTabResults = [[tabId, results]]
    const parsedTabResults = new Map(
      newTabResults.map(([k, v]) => [k, new Map(v)])
    )
    localGetMock.mockImplementationOnce(mockGet([]))
    localGetMock.mockImplementationOnce(mockGet(newTabResults))
    const tabResults = await actions.setTabResults(tabId, new Map(results))
    expect(localSetMock).toHaveBeenCalledWith({ tabResults: newTabResults })
    expect(tabResults).toEqual(parsedTabResults)
  })

  test('removeTabResults()', async () => {
    const serializablePrevTabresults: SerializableTabResults = [
      [1, [['host1', []]]],
      [2, [['host2', []]]]
    ]
    const serializableNewTabresults: SerializableTabResults = [
      [1, [['host1', []]]]
    ]
    const newTabResults: TabResults = new Map([[1, new Map([['host1', []]])]])
    localGetMock.mockImplementationOnce(mockGet(serializablePrevTabresults))
    localGetMock.mockImplementationOnce(mockGet(serializableNewTabresults))
    const tabResults = await actions.removeTabResults(2)
    expect(localSetMock).toHaveBeenCalledWith({
      tabResults: serializableNewTabresults
    })
    expect(tabResults).toEqual(newTabResults)
  })

  test('purgeHost()', async () => {
    const serializablePrevTabresults: SerializableTabResults = [
      [
        1,
        [
          ['host1', []],
          ['host2', []]
        ]
      ],
      [2, [['host2', []]]]
    ]
    const serializableNewTabresults: SerializableTabResults = [
      [1, [['host1', []]]],
      [2, []]
    ]
    const newTabresults: TabResults = new Map([
      [1, new Map([['host1', []]])],
      [2, new Map([])]
    ])
    localGetMock.mockImplementationOnce(mockGet(serializablePrevTabresults))
    localGetMock.mockImplementationOnce(mockGet(serializableNewTabresults))
    const tabResults = await actions.purgeHost('host2')
    expect(localSetMock).toHaveBeenCalledWith({
      tabResults: serializableNewTabresults
    })
    expect(tabResults).toEqual(newTabresults)
  })

  test('clear()', async () => {
    const tabResults = await actions.clear()
    expect(localSetMock).toHaveBeenCalledWith({
      tabResults: []
    })
    expect(tabResults).toEqual(new Map([]))
  })
  test('fetch(), storage unavailable', async () => {
    localGetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    global.console.error = jest.fn()
    const preferences = await actions.fetch()
    expect(global.console.error).toHaveBeenCalledTimes(1)
    expect(preferences).toEqual(new Map())
    global.console.error = consoleError
  })

  test('add(), storage unavailable', async () => {
    localGetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    localSetMock.mockImplementationOnce(() => {
      throw new Error()
    })
    global.console.error = jest.fn()
    await actions.setTabResults(1, new Map())
    expect(global.console.error).toHaveBeenCalledTimes(2)
    global.console.error = consoleError
  })
})
