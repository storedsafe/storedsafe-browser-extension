import '../../../__mocks__/browser'
import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { act, render, fireEvent, waitFor, screen } from '@testing-library/react'

import { useTabResults } from '../useTabResults'

/// /////////////////////////////////////////////////////////
// Set up mocks of external dependencies

const mockTabResults: SerializableTabResults = [
  [
    1,
    [
      [
        'host',
        [
          {
            icon: 'icon',
            id: 'id',
            isDecrypted: true,
            name: 'name',
            templateId: 'templateId',
            type: 'type',
            vaultId: 'vaultId',
            fields: [
              {
                isEncrypted: true,
                isPassword: true,
                name: 'field',
                title: 'title',
                isShowing: true,
                value: 'value'
              }
            ]
          }
        ]
      ]
    ]
  ]
]
const mockGet = jest.fn(
  async (key: string) =>
    await Promise.resolve({
      tabResults: mockTabResults
    })
)
browser.storage.local.get = mockGet

const mockSet = jest.fn(async () => await Promise.resolve())
browser.storage.local.set = mockSet
const testError = jest.fn()

function manualGetMock (): {
  res: () => void
  rej: (reason?: any) => void
} {
  let res, rej
  const promise = new Promise<{ tabResults: SerializableTabResults }>(
    (resolve, reject) => {
      res = () => {
        resolve({ tabResults: mockTabResults })
      }
      rej = (reason?: any) => {
        reject(reason)
      }
    }
  )

  mockGet.mockImplementationOnce(async (key: string) => await promise)
  return { res, rej }
}

/// /////////////////////////////////////////////////////////
// Set up React component for testing hook in.

const TabResultsComponent: React.FunctionComponent = () => {
  const tabResults = useTabResults()

  function handleFetch (): void {
    tabResults.fetch().catch(error => {
      testError(error)
    })
  }

  function handleClear (): void {
    tabResults.clear().catch(error => {
      testError(error)
    })
  }

  return (
    <section>
      <p data-testid='isInitialized'>
        {tabResults.isInitialized ? 'initialized' : 'waiting'}
      </p>
      <p data-testid='tabResults'>
        {JSON.stringify([...tabResults.tabResults].map(([k, v]) => [k, [...v]]))}
      </p>
      <button data-testid='fetch' onClick={handleFetch} />
      <button data-testid='clear' onClick={handleClear} />
    </section>
  )
}

/// /////////////////////////////////////////////////////////
// Run tests

beforeEach(() => {
  mockGet.mockClear()
  mockSet.mockClear()
})

/**
 * Comprehensive state test
 */
test('useTabResults(), test component', async () => {
  const { res } = manualGetMock()

  act(() => {
    render(<TabResultsComponent />)
  })

  const isInitialized = screen.getByTestId('isInitialized')
  const tabResults = screen.getByTestId('tabResults')

  // Before hook is initialized
  expect(isInitialized.innerHTML).toEqual('waiting')
  expect(tabResults.innerHTML).toEqual(JSON.stringify([...new Map()]))

  act(() => {
    res()
  })
  await waitFor(() => screen.getByText('initialized'))

  expect(mockGet).toHaveBeenCalledTimes(1)

  // After hook is intialized
  expect(mockGet).toHaveBeenCalledWith('tabResults')
  expect(isInitialized.innerHTML).toEqual('initialized')
  expect(tabResults.innerHTML).toEqual(JSON.stringify(mockTabResults))

  // Test events
  fireEvent.click(screen.getByTestId('clear'))
  await waitFor(() =>
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        tabResults: []
      })
    )
  )

  mockGet.mockClear()
  fireEvent.click(screen.getByTestId('fetch'))
  await waitFor(() => {
    expect(mockGet).toHaveBeenNthCalledWith(1, 'tabResults')
  })
})

/**
 * Test error handling
 */
test('useTabResults(), fail init', async () => {
  const { rej } = manualGetMock()
  const spy = jest.spyOn(global.console, 'error').mockImplementation(() => {})

  act(() => {
    render(<TabResultsComponent />)
    rej('Local Storage Error')
  })
  await waitFor(() => expect(spy).toHaveBeenCalled())
  expect(spy).toHaveBeenCalledWith('Local Storage Error')
  spy.mockRestore()
})

/**
 * Test external updates
 */
type ChangeListener = (
  changes: { [key: string]: browser.storage.StorageChange },
  areaName: string
) => void

test('useTabResults(), local storage change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<TabResultsComponent />)
  })

  await waitFor(() => screen.getByText('initialized'))

  const changeTabResults: SerializableTabResults = [[2, [['change', []]]]]

  act(() => {
    for (const listener of listeners) {
      listener(
        {
          tabResults: {
            newValue: [...mockTabResults, ...changeTabResults]
          }
        },
        'local'
      )
    }
  })

  const tabResults = screen.getByTestId('tabResults')

  // Before hook is initialized
  expect(tabResults.innerHTML).toEqual(
    JSON.stringify([...mockTabResults, ...changeTabResults])
  )
})

test('useTabResults(), skip change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<TabResultsComponent />)
  })

  await waitFor(() => screen.getByText('initialized'))
  const tabResults = screen.getByTestId('tabResults')

  const changeTabResults: SerializableTabResults = [[2, [['change', []]]]]

  // Sync storage
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          tabResults: {
            newValue: [...mockTabResults, ...changeTabResults]
          }
        },
        'sync'
      )
    }
  })
  expect(tabResults.innerHTML).toEqual(JSON.stringify([...mockTabResults]))

  // Managed storage
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          tabResults: {
            newValue: [...mockTabResults, ...changeTabResults]
          }
        },
        'managed'
      )
    }
  })
  expect(tabResults.innerHTML).toEqual(JSON.stringify(mockTabResults))

  // Wrong key
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          notTabResults: {
            newValue: [...mockTabResults, ...changeTabResults]
          }
        },
        'local'
      )
    }
  })
  expect(tabResults.innerHTML).toEqual(JSON.stringify([...mockTabResults]))
})
