import '../../../__mocks__/browser'
import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { act, render, fireEvent, waitFor, screen } from '@testing-library/react'

import { usePreferences } from '../usePreferences'

/// /////////////////////////////////////////////////////////
// Set up mocks of external dependencies

const mockPreferences: Preferences = {
  lastUsedSite: 'host',
  sites: {
    host: { username: 'username', loginType: 'totp' }
  }
}
const mockGet = jest.fn(
  async (key: string) =>
    await Promise.resolve({
      preferences: mockPreferences
    })
)
browser.storage.local.get = mockGet

const mockChangePreferences: Preferences = {
  ...mockPreferences,
  lastUsedSite: 'change_host',
  sites: {
    host: {
      username: 'change_username',
      loginType: mockPreferences.sites.host.loginType
    },
    change: { loginType: 'yubikey' }
  }
}

const mockSet = jest.fn(async () => await Promise.resolve())
browser.storage.local.set = mockSet
const testError = jest.fn()

function manualGetMock (): {
  res: () => void
  rej: (reason?: any) => void
} {
  let res, rej
  const promise = new Promise<{ preferences: Preferences }>(
    (resolve, reject) => {
      res = () => {
        resolve({ preferences: mockPreferences })
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

const PreferencesComponent: React.FunctionComponent = () => {
  const preferences = usePreferences()

  function handleSetLastUsedSite (): void {
    preferences.setLastUsedSite('change').catch(error => {
      testError(error)
    })
  }

  function handleUpdateSitePreferences (): void {
    preferences
      .updateSitePreferences('host', {
        username: 'change',
        loginType: 'yubikey'
      })
      .catch(error => {
        testError(error)
      })
  }

  function handleFetch (): void {
    preferences.fetch().catch(error => {
      testError(error)
    })
  }

  function handleClear (): void {
    preferences.clear().catch(error => {
      testError(error)
    })
  }

  return (
    <section>
      <p data-testid='isInitialized'>
        {preferences.isInitialized ? 'initialized' : 'waiting'}
      </p>
      <p data-testid='lastUsedSite'>{preferences.lastUsedSite}</p>
      <p data-testid='sites'>{JSON.stringify(preferences.sites)}</p>
      <button data-testid='setLastUsedSite' onClick={handleSetLastUsedSite} />
      <button
        data-testid='updateSitePreferences'
        onClick={handleUpdateSitePreferences}
      />
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
test('usePreferences(), test component', async () => {
  const { res } = manualGetMock()

  act(() => {
    render(<PreferencesComponent />)
  })

  const isInitialized = screen.getByTestId('isInitialized')
  const lastUsedSite = screen.getByTestId('lastUsedSite')
  const sites = screen.getByTestId('sites')

  // Before hook is initialized
  expect(isInitialized.innerHTML).toEqual('waiting')
  expect(lastUsedSite.innerHTML).toEqual('')
  expect(sites.innerHTML).toEqual(JSON.stringify({}))

  act(() => {
    res()
  })
  await waitFor(() => screen.getByText('initialized'))

  expect(mockGet).toHaveBeenCalledTimes(1)

  // After hook is intialized
  expect(mockGet).toHaveBeenCalledWith('preferences')
  expect(isInitialized.innerHTML).toEqual('initialized')
  expect(lastUsedSite.innerHTML).toEqual('host')
  expect(sites.innerHTML).toEqual(JSON.stringify(mockPreferences.sites))

  // Test events
  fireEvent.click(screen.getByTestId('setLastUsedSite'))
  await waitFor(() => expect(mockSet).toHaveBeenCalled())
  expect(mockSet).toHaveBeenCalledWith(
    expect.objectContaining({
      preferences: { ...mockPreferences, lastUsedSite: 'change' }
    })
  )

  fireEvent.click(screen.getByTestId('updateSitePreferences'))
  await waitFor(() => expect(mockSet).toHaveBeenCalled())
  expect(mockSet).toHaveBeenCalledWith(
    expect.objectContaining({
      preferences: {
        ...mockPreferences,
        sites: { host: { username: 'change', loginType: 'yubikey' } }
      }
    })
  )

  fireEvent.click(screen.getByTestId('clear'))
  await waitFor(() => expect(mockSet).toHaveBeenCalled())
  expect(mockSet).toHaveBeenCalledWith(
    expect.objectContaining({
      preferences: { sites: {} }
    })
  )

  mockGet.mockClear()
  fireEvent.click(screen.getByTestId('fetch'))
  await waitFor(() => {
    expect(mockGet).toHaveBeenCalled()
  })
  expect(mockGet).toHaveBeenNthCalledWith(1, 'preferences')
})

/**
 * Test error handling
 */
test('usePreferences(), fail init', async () => {
  const { rej } = manualGetMock()
  const spy = jest.spyOn(global.console, 'error').mockImplementation(() => {})

  act(() => {
    render(<PreferencesComponent />)
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

test('usePreferences(), local storage change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<PreferencesComponent />)
  })

  await waitFor(() => screen.getByText('initialized'))

  act(() => {
    for (const listener of listeners) {
      listener(
        {
          preferences: {
            newValue: mockChangePreferences
          }
        },
        'local'
      )
    }
  })

  const lastUsedSite = screen.getByTestId('lastUsedSite')
  const sites = screen.getByTestId('sites')

  expect(lastUsedSite.innerHTML).toEqual(mockChangePreferences.lastUsedSite)
  expect(sites.innerHTML).toEqual(JSON.stringify(mockChangePreferences.sites))
})

test('usePreferences(), skip change', async () => {
  const listeners: ChangeListener[] = []
  browser.storage.onChanged.addListener = jest.fn(listener => {
    listeners.push(listener)
  })
  act(() => {
    render(<PreferencesComponent />)
  })

  await waitFor(() => screen.getByText('initialized'))

  const lastUsedSite = screen.getByTestId('lastUsedSite')
  const sites = screen.getByTestId('sites')

  // Sync storage
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          preferences: {
            newValue: mockChangePreferences
          }
        },
        'sync'
      )
    }
  })

  expect(lastUsedSite.innerHTML).toEqual(mockPreferences.lastUsedSite)
  expect(sites.innerHTML).toEqual(JSON.stringify(mockPreferences.sites))

  // Managed storage
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          preferences: {
            newValue: mockChangePreferences
          }
        },
        'managed'
      )
    }
  })

  expect(lastUsedSite.innerHTML).toEqual(mockPreferences.lastUsedSite)
  expect(sites.innerHTML).toEqual(JSON.stringify(mockPreferences.sites))

  // Wrong key
  act(() => {
    for (const listener of listeners) {
      listener(
        {
          notpreferences: {
            newValue: mockChangePreferences
          }
        },
        'local'
      )
    }
  })
  expect(lastUsedSite.innerHTML).toEqual(mockPreferences.lastUsedSite)
  expect(sites.innerHTML).toEqual(JSON.stringify(mockPreferences.sites))
})
