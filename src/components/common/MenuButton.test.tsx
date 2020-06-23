import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { MenuButton } from './MenuButton'
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

const onClick = jest.fn()

test('<MenuButton />', () => {
  act(() => {
    render(
      <MenuButton title='Button' icon={<svg />} onClick={onClick} />,
      container
    )
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})

test('<MenuButton selected=true />', () => {
  act(() => {
    render(
      <MenuButton
        title='Button'
        icon={<svg />}
        onClick={onClick}
        selected={true}
      />,
      container
    )
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})

test('<MenuButton selected=false />', () => {
  act(() => {
    render(
      <MenuButton
        title='Button'
        icon={<svg />}
        onClick={onClick}
        selected={false}
      />,
      container
    )
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()
})

test('<MenuButton click />', () => {
  act(() => {
    render(
      <MenuButton
        title='Button'
        icon={<svg />}
        onClick={onClick}
        selected={false}
      />,
      container
    )
  })

  const button = container.querySelector('button')
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  expect(onClick).toHaveBeenCalled()
})
