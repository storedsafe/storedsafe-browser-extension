import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { act, render, fireEvent, screen } from '@testing-library/react'

import { useForm } from './utils/useForm'

interface Values {
  text: string
  count: number
  range: number
  longText: string
  select: 'foo' | 'bar'
  selectMultiple: Array<'foo' | 'bar'>
  checked: boolean
}

const defaultValues: Values = {
  text: '',
  count: 0,
  range: 0,
  longText: '',
  select: 'foo',
  selectMultiple: ['foo'],
  checked: false
}

const callbacks = {
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn()
}

const Form: React.FunctionComponent = () => {
  const [values, events] = useForm<Values>(defaultValues, callbacks)

  return (
    <form>
      <input
        data-testid='text'
        type='text'
        name='text'
        value={values.text}
        {...events}
      />
      <input
        data-testid='number'
        type='number'
        name='count'
        value={values.count}
        {...events}
      />
      <input
        data-testid='range'
        type='range'
        name='range'
        value={values.range}
        {...events}
      />
      <input
        data-testid='checkbox'
        type='checkbox'
        name='checked'
        checked={values.checked}
        {...events}
      />
      <textarea
        data-testid='textarea'
        name='longText'
        value={values.longText}
        {...events}
      />
      <select
        data-testid='select'
        name='select'
        value={values.select}
        {...events}
      >
        <option value='foo'>Foo</option>
        <option value='bar'>Bar</option>
      </select>
      <select
        data-testid='select-multiple'
        name='selectMultiple'
        multiple
        value={values.selectMultiple}
        {...events}
      >
        <option data-testid='select-option' value='foo'>
          Foo
        </option>
        <option data-testid='select-option' value='bar'>
          Bar
        </option>
      </select>
    </form>
  )
}

beforeEach(() => {
  callbacks.onChange.mockClear()
  callbacks.onBlur.mockClear()
  callbacks.onFocus.mockClear()
})

test('input type=text', () => {
  const value = 'foo'
  act(() => {
    render(<Form />)
  })
  const input = screen.getByTestId('text')
  fireEvent.change(input, { target: { value } })
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'text')
})

test('input type=number', () => {
  const value = 83
  act(() => {
    render(<Form />)
  })
  const input = screen.getByTestId('number')
  fireEvent.change(input, { target: { valueAsNumber: value, value } })
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'count')
})

test('input type=number, empty', () => {
  const value = ''
  act(() => {
    render(<Form />)
  })
  const input = screen.getByTestId('number')
  fireEvent.change(input, { target: { value } })
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'count')
})

test('input type=range', () => {
  const value = 42
  act(() => {
    render(<Form />)
  })
  const input = screen.getByTestId('range')
  fireEvent.change(input, { target: { valueAsNumber: value, value } })
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'range')
})

test('input type=checkbox', () => {
  const value = true
  act(() => {
    render(<Form />)
  })
  const input = screen.getByTestId('checkbox')
  fireEvent.click(input)
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'checked')
})

test('textarea', () => {
  const value = 'Long Text'
  act(() => {
    render(<Form />)
  })
  const input = screen.getByTestId('textarea')
  fireEvent.change(input, { target: { value } })
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'longText')
})

test('select', () => {
  const value = 'bar'
  act(() => {
    render(<Form />)
  })
  const input = screen.getByTestId('select')
  fireEvent.change(input, { target: { value } })
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'select')
})

test('select multiple', () => {
  const value = ['foo', 'bar']
  act(() => {
    render(<Form />)
  })
  for (const option of screen.getAllByTestId('select-option')) {
    ;(option as HTMLOptionElement).selected = true
  }
  const input = screen.getByTestId('select-multiple')
  fireEvent.change(input)
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'selectMultiple')
})
