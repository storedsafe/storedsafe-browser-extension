import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { Checkbox } from './Checkbox'
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

test('<Checkbox />', () => {
  act(() => {
    render(<Checkbox name='test-name' id='test-id' />, container)
  })

  expect(
    container.querySelector('input[type="checkbox"]#test-id')
  ).not.toBeNull()
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})

test('<Checkbox checked />', () => {
  act(() => {
    render(<Checkbox checked={true} onChange={jest.fn()} />, container)
  })

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const input = container.querySelector(
    'input[type="checkbox"]'
  ) as HTMLInputElement
  expect(input.checked).toBe(true)
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})
