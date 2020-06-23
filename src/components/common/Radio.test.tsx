import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { Radio } from './Radio'
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

test('<Radio />', () => {
  act(() => {
    render(<Radio name='test-name' id='test-id' />, container)
  })

  expect(container.querySelector('input[type="radio"]#test-id')).not.toBeNull()
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})

test('<Radio checked />', () => {
  act(() => {
    render(
      <Radio checked={true} onChange={jest.fn()} />,
      container
    )
  })

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const input = container.querySelector(
    'input[type="radio"]'
  ) as HTMLInputElement
  expect(input.checked).toBe(true)
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})
