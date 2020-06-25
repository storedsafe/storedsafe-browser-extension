import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { ListView, ListItem } from '../ListView'
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

test('<ListView select />', () => {
  const items: ListItem[] = [
    {
      key: 'item1',
      title: <h1 className='title-1'>Title 1</h1>,
      content: <section>Item 1</section>
    },
    {
      key: 'item2',
      title: <h1 className='title-2'>Title 2</h1>,
      content: <section>Item 2</section>
    }
  ]

  act(() => {
    render(<ListView items={items} />, container)
  })

  const title1 = container.querySelector('.title-1')
  const title2 = container.querySelector('.title-2')
  let item1: HTMLElement, item2: HTMLElement

  // No selected or hidden initially
  item1 = container.querySelector('.list-view-item.selected .title-1')
  item2 = container.querySelector('.list-view-item.selected .title-2')
  expect(item1).toBeNull()
  expect(item2).toBeNull()
  item1 = container.querySelector('.list-view-item.hidden .title-1')
  item2 = container.querySelector('.list-view-item.hidden .title-2')
  expect(item1).toBeNull()
  expect(item2).toBeNull()

  // select 1
  act(() => {
    title1.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  item1 = container.querySelector('.list-view-item.selected .title-1')
  item2 = container.querySelector('.list-view-item.selected .title-2')
  expect(item1).not.toBeNull()
  expect(item2).toBeNull()
  item1 = container.querySelector('.list-view-item.hidden .title-1')
  item2 = container.querySelector('.list-view-item.hidden .title-2')
  expect(item1).toBeNull()
  expect(item2).not.toBeNull()

  // select 2 (swap)
  act(() => {
    title2.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  item1 = container.querySelector('.list-view-item.selected .title-1')
  item2 = container.querySelector('.list-view-item.selected .title-2')
  expect(item1).toBeNull()
  expect(item2).not.toBeNull()
  item1 = container.querySelector('.list-view-item.hidden .title-1')
  item2 = container.querySelector('.list-view-item.hidden .title-2')
  expect(item1).not.toBeNull()
  expect(item2).toBeNull()

  // deselect
  act(() => {
    title2.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  expect(pretty(container.innerHTML)).toMatchSnapshot()

  item1 = container.querySelector('.list-view-item.selected .title-1')
  item2 = container.querySelector('.list-view-item.selected .title-2')
  expect(item1).toBeNull()
  expect(item2).toBeNull()
  item1 = container.querySelector('.list-view-item.hidden .title-1')
  item2 = container.querySelector('.list-view-item.hidden .title-2')
  expect(item1).toBeNull()
  expect(item2).toBeNull()
})
