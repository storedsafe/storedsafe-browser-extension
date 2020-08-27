import '../../../__mocks__/browser'
import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { act, render, fireEvent, waitFor, screen } from '@testing-library/react'

import { useIgnore } from '../useIgnore'

/// /////////////////////////////////////////////////////////
// Set up mocks of external dependencies

const mockIgnore: Ignore = ['host']
const mockGet = jest.fn(
  async (key: string) =>
    await Promise.resolve({
      ignore: mockIgnore
    })
)
browser.storage.sync.get = mockGet

const mockAddIgnore: Ignore = ['add']

const mockSet = jest.fn(async () => await Promise.resolve())
browser.storage.sync.set = mockSet
const testError = jest.fn()

function manualGetMock (): {
  res: () => void
  rej: (reason?: any) => void
} {
  let res, rej
  const promise = new Promise<{ ignore: Ignore }>((resolve, reject) => {
    res = () => {
      resolve({ ignore: mockIgnore })
    }
    rej = (reason?: any) => {
      reject(reason)
    }
  })

  mockGet.mockImplementationOnce(async (key: string) => await promise)
  return { res, rej }
}

/// /////////////////////////////////////////////////////////
// Set up React component for testing hook in.

const IgnoreComponent: React.FunctionComponent = () => {
  const ignore = useIgnore()

  function handleAdd (): void {
    const host = mockAddIgnore[0]
    ignore.add(host).catch(error => {
      testError(error)
    })
  }

  function handleRemove (): void {
    ignore.remove('host').catch(error => {
      testError(error)
    })
  }

  function handleFetch (): void {
    ignore.fetch().catch(error => {
      testError(error)
    })
  }

  function handleClear (): void {
    ignore.clear().catch(error => {
      testError(error)
    })
  }

  return (
    <section>
      <p data-testid='isInitialized'>
        {ignore.isInitialized ? 'initialized' : 'waiting'}
      </p>
      <p data-testid='ignore'>{JSON.stringify([...ignore.ignore])}</p>
      <button data-testid='add' onClick={handleAdd} />
      <button data-testid='remove' onClick={handleRemove} />
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
test('useIgnore(), test component', async () => {
  const { res } = manualGetMock()

  act(() => {
    render(<IgnoreComponent />)
  })

  const isInitialized = screen.getByTestId('isInitialized')
  const ignore = screen.getByTestId('ignore')

  // Before hook is initialized
  expect(isInitialized.innerHTML).toEqual('waiting')
  expect(ignore.innerHTML).toEqual(JSON.stringify([...new Map()]))

  act(() => {
    res()
  })
  await waitFor(() => screen.getByText('initialized'))

  expect(mockGet).toHaveBeenCalledTimes(1)

  // After hook is intialized
  expect(mockGet).toHaveBeenCalledWith('ignore')
  expect(isInitialized.innerHTML).toEqual('initialized')
  expect(ignore.innerHTML).toEqual(JSON.stringify(mockIgnore))

  // Test events
  fireEvent.click(screen.getByTestId('add'))
  await waitFor(() => expect(mockSet).toHaveBeenCalled())
  expect(mockSet).toHaveBeenCalledWith(
    expect.objectContaining({
      ignore: [...mockIgnore, ...mockAddIgnore]
    })
  )

  fireEvent.click(screen.getByTestId('remove'))
  await waitFor(() => expect(mockSet).toHaveBeenCalled())
  expect(mockSet).toHaveBeenCalledWith(
    expect.objectContaining({
      ignore: []
    })
  )

  fireEvent.click(screen.getByTestId('clear'))
  await waitFor(() => expect(mockSet).toHaveBeenCalled())
  expect(mockSet).toHaveBeenCalledWith(
    expect.objectContaining({
      ignore: []
    })
  )

  mockGet.mockClear()
  fireEvent.click(screen.getByTestId('fetch'))
  await waitFor(() => {
    expect(mockGet).toHaveBeenCalled()
  })
  expect(mockGet).toHaveBeenNthCalledWith(1, 'ignore')
})

/**
 * Test error handling
 */
test('useIgnore(), fail init', async () => {
  const { rej } = manualGetMock()
  const spy = jest.spyOn(global.console, 'error').mockImplementation(() => {})

  act(() => {
    render(<IgnoreComponent />)
    rej('Sync Storage Error')
  })
  await waitFor(() => expect(spy).toHaveBeenCalled())
  expect(spy).toHaveBeenCalledWith('Sync Storage Error')
  spy.mockRestore()
})

/**
 * Test external updates
 */
type ChangeListener = (
  changes: { [key: string]: browser.storage.StorageChange },
  areaName: string
) => void

test('useIgnore(), sync storage change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<IgnoreComponent />)
  })

  await waitFor(() => screen.getByText('initialized'))

  act(() => {
    for (const listener of listeners) {
      listener(
        {
          ignore: {
            newValue: [...mockIgnore, ...mockAddIgnore]
          }
        },
        'sync'
      )
    }
  })

  const ignore = screen.getByTestId('ignore')

  expect(ignore.innerHTML).toEqual(
    JSON.stringify([...mockIgnore, ...mockAddIgnore])
  )
})

test('useIgnore(), skip change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<IgnoreComponent />)
  })

  await waitFor(() => screen.getByText('initialized'))

  const ignore = screen.getByTestId('ignore')

  // Local storage
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          ignore: {
            newValue: [...mockIgnore, ...mockAddIgnore]
          }
        },
        'local'
      )
    }
  })

  expect(ignore.innerHTML).toEqual(JSON.stringify(mockIgnore))

  // Managed storage
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          ignore: {
            newValue: [...mockIgnore, ...mockAddIgnore]
          }
        },
        'managed'
      )
    }
  })

  expect(ignore.innerHTML).toEqual(JSON.stringify(mockIgnore))

  // Wrong key
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          notignore: {
            newValue: [...mockIgnore, ...mockAddIgnore]
          }
        },
        'sync'
      )
    }
  })
  expect(ignore.innerHTML).toEqual(JSON.stringify(mockIgnore))
})
