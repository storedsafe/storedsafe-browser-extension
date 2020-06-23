import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { LoadingSpinner } from './LoadingSpinner'
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

test('<LoadingSpinner />', () => {
  act(() => {
    render(<LoadingSpinner />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})

test('<LoadingSpinner loading />', () => {
  act(() => {
    render(<LoadingSpinner status='loading' />, container)
  })
  expect(container.innerHTML).toMatchSnapshot()
})

test('<LoadingSpinner success />', () => {
  act(() => {
    render(<LoadingSpinner status='success' />, container)
  })
  expect(container.innerHTML).toMatchSnapshot()
})

test('<LoadingSpinner warning />', () => {
  act(() => {
    render(<LoadingSpinner status='warning' />, container)
  })
  expect(container.innerHTML).toMatchSnapshot()
})

test('<LoadingSpinner error />', () => {
  act(() => {
    render(<LoadingSpinner status='error' />, container)
  })
  expect(container.innerHTML).toMatchSnapshot()
})
