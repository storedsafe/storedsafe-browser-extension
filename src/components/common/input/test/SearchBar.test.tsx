import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act, Simulate } from 'react-dom/test-utils'
import { SearchBar } from '../SearchBar'
import pretty from 'pretty'

/**
 * Set up and tear down container to mount tested component in.
 * */
let container: Element = null
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div')
  document.body.appendChild(container)
})
afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container)
  container.remove()
  container = null
})

test('<SearchBar isLoading=true />', () => {
  const needle = 'foo'
  const isLoading = true
  const onSearch = jest.fn()
  const onNeedleChange = jest.fn()

  act(() => {
    render(
      <SearchBar
        needle={needle}
        onSearch={onSearch}
        onNeedleChange={onNeedleChange}
        isLoading={isLoading}
      />,
      container
    )
  })

  expect(pretty(container.innerHTML)).toMatchSnapshot()
})

test('<SearchBar isLoading=false />', () => {
  const needle = 'foo'
  const isLoading = false
  const onSearch = jest.fn()
  const onNeedleChange = jest.fn()

  act(() => {
    render(
      <SearchBar
        needle={needle}
        onSearch={onSearch}
        onNeedleChange={onNeedleChange}
        isLoading={isLoading}
      />,
      container
    )
  })
})

test('<SearchBar disabled />', () => {
  const needle = 'foo'
  const isLoading = false
  const disabled = true
  const onSearch = jest.fn()
  const onNeedleChange = jest.fn()

  act(() => {
    render(
      <SearchBar
        needle={needle}
        onSearch={onSearch}
        onNeedleChange={onNeedleChange}
        isLoading={isLoading}
        disabled={disabled}
      />,
      container
    )
  })
})

test('<SearchBar interaction />', () => {
  const needle = 'foo'
  const isLoading = false
  const onSearch = jest.fn()
  const onNeedleChange = jest.fn()

  act(() => {
    render(
      <SearchBar
        needle={needle}
        onSearch={onSearch}
        onNeedleChange={onNeedleChange}
        isLoading={isLoading}
      />,
      container
    )
  })

  const searchInput: HTMLInputElement = container.querySelector(
    '.search-bar-input'
  )
  act(() => {
    searchInput.value = 'bar'
    Simulate.change(searchInput)
  })
  expect(onNeedleChange).toHaveBeenCalledWith('bar')

  act(() => {
    Simulate.submit(searchInput)
  })
  expect(onSearch).toHaveBeenCalledWith()
})
