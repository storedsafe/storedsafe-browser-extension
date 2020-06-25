import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { Message } from '../Message'
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

test('<Message />', () => {
  act(() => {
    render(<Message />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  act(() => {
    render(<Message type="info" />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  act(() => {
    render(<Message type="warning" />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  act(() => {
    render(<Message type="error" />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  act(() => {
    render(<Message>children</Message>, container)
  })
  const message = container.querySelector('.message')
  expect(message.innerHTML).toBe('children')
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})
