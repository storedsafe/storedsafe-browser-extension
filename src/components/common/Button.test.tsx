import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { Button } from './Button'
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

test('<Button />', () => {
  act(() => {
    render(<Button />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  act(() => {
    render(<Button color='primary' />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  act(() => {
    render(<Button color='accent' />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  act(() => {
    render(<Button color='warning' />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  act(() => {
    render(<Button color='danger' />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  act(() => {
    render(<Button isLoading={true} />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  act(() => {
    render(<Button>children</Button>, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})
