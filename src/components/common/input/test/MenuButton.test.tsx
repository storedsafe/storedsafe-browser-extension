import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { MenuButton } from '../MenuButton'
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

test('<MenuButton />', () => {
  act(() => {
    render(<MenuButton icon={<p>icon</p>} />, container)
  })

  expect(pretty(container.innerHTML)).toMatchSnapshot()
})
