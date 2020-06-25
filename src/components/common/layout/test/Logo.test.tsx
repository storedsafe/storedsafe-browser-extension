import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { Logo } from '../Logo'
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

test('<Logo />', () => {
  act(() => {
    render(<Logo />, container)
  })

  expect(pretty(container.innerHTML)).toMatchSnapshot()
})
