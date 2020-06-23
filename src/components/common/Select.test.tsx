import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { Select } from './Select'
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

test('<Select />', () => {
  act(() => {
    render(
      <Select name='test-name' id='test-id'>
        <option value='foo'>Foo</option>
        <option value='bar'>Bar</option>
      </Select>,
      container
    )
  })
  const select = container.querySelector('select#test-id')
  expect(select.querySelectorAll('option').length).toBe(2)
  expect(container.querySelector('div.custom-select')).not.toBeNull()
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})
