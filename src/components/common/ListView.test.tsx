import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { ListView, ListItem } from './ListView'
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

test('<ListView />', () => {
  act(() => {
    render(<ListView items={[]} />, container)
  })

  expect(pretty(container.innerHTML)).toMatchSnapshot()
})

test('<ListView children />', () => {
  const items: ListItem[] = [
    {
      key: 'item1',
      title: <h1>Title 1</h1>,
      content: <section>Item 1</section>
    },
    {
      key: 'item2',
      title: <h1>Title 2</h1>,
      content: <section>Item 2</section>
    }
  ]
  act(() => {
    render(<ListView items={items} />, container)
  })

  expect(pretty(container.innerHTML)).toMatchSnapshot()
})
