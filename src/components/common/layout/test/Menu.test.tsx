import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import pretty from 'pretty'
import { Menu, MenuItem } from '../Menu'

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

const fooClick = jest.fn()
const barClick = jest.fn()

const items: MenuItem[] = [
  { title: 'foo', icon: <svg>icon</svg>, onClick: fooClick },
  { title: 'bar', icon: <p>icon</p>, onClick: barClick }
]

beforeEach(() => {
  fooClick.mockClear()
  barClick.mockClear()
})

test('<Menu show={false} />', () => {
  act(() => {
    render(<Menu items={items} show={false} />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})

test('<Menu show={true} />', () => {
  act(() => {
    render(<Menu items={items} show={true} />, container)
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})

test('<Menu />', () => {
  act(() => {
    render(<Menu items={items} show={true} />, container)
  })

  const [foo, bar] = document.querySelectorAll('.menu-item')

  fooClick.mockClear()
  barClick.mockClear()
  act(() => {
    foo.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  expect(fooClick).toHaveBeenCalledTimes(1)
  expect(barClick).not.toHaveBeenCalled()

  fooClick.mockClear()
  barClick.mockClear()
  act(() => {
    bar.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  expect(fooClick).not.toHaveBeenCalled()
  expect(barClick).toHaveBeenCalledTimes(1)
})
