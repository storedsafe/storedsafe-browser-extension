import React, { useState } from 'react'
import { Button, ButtonColor } from '../Button'
import { Checkbox } from '../Checkbox'
import { Radio } from '../Radio'
import { Select } from '../Select'
import {
  SearchBar,
  OnNeedleChangeCallback,
  OnSearchCallback
} from '../SearchBar'
import { action } from '@storybook/addon-actions'
import { MenuButton } from '../MenuButton'

export default {
  title: 'Input'
}

/// /////////////////////////////////////////////////////////
// Example data

const options = [1, 2, 3, 4, 5].map(n => (
  <option key={n} value={n}>
    Option {n}
  </option>
))

const icon = (
  <svg
    width='40'
    height='40'
    version='1.1'
    viewBox='0 0 10.583 10.583'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      transform='scale(.26458)'
      d='m5.2637 0c-2.9158 5.9212e-16-5.2637 2.288-5.2637 5.1309v28.738c5.9212e-16 2.8429 2.3479 5.1309 5.2637 5.1309h-.26367v1h3v-1h24v1h3v-1h-.26367c2.9158 0 5.2637-2.288 5.2637-5.1309v-28.738c0-2.8429-2.3479-5.1309-5.2637-5.1309h-29.473zm1.2812 1.6973h26.91c2.662 0 4.8047 2.0901 4.8047 4.6855v26.234c0 2.5955-2.1427 4.6855-4.8047 4.6855h-26.91c-2.662 0-4.8047-2.0901-4.8047-4.6855v-26.234c0-2.5955 2.1427-4.6855 4.8047-4.6855zm.83984 1.1074c-2.4963 0-4.5078 1.9607-4.5078 4.3945v24.602c0 2.4338 2.0116 4.3945 4.5078 4.3945h25.23c2.4963 0 4.5078-1.9607 4.5078-4.3945v-24.602c0-2.4338-2.0116-4.3945-4.5078-4.3945h-25.23zm20.492 11.256a5.9606 5.9606 0 01.125 0 5.9606 5.9606 0 015.959 5.959 5.9606 5.9606 0 01-5.959 5.959 5.9606 5.9606 0 01-5.9629-5.959 5.9606 5.9606 0 015.8379-5.959zm.125 1.4453a4.5134 4.5134 0 00-4.5137 4.5137 4.5134 4.5134 0 004.5137 4.5137 4.5134 4.5134 0 004.5117-4.5137 4.5134 4.5134 0 00-4.5117-4.5137zm-18.609.14844a4.3661 4.3661 0 012.2793.58398 4.3661 4.3661 0 012.0449 2.6992h3.0117c.39944 0 .7207.32127.7207.7207v.72266c0 .39944-.32126.7207-.7207.7207h-3.0117a4.3661 4.3661 0 01-.44727 1.1016 4.3661 4.3661 0 01-5.9648 1.5977 4.3661 4.3661 0 01-1.5977-5.9648 4.3661 4.3661 0 013.6855-2.1816zm18.609 1a3.3644 3.3644 0 013.3633 3.3652 3.3644 3.3644 0 01-3.3633 3.3652 3.3644 3.3644 0 01-3.3652-3.3652 3.3644 3.3644 0 013.3652-3.3652zm-18.57.58203a2.7845 2.7845 0 00-2.3555 1.3906 2.7845 2.7845 0 001.0195 3.8027 2.7845 2.7845 0 003.8027-1.0176 2.7845 2.7845 0 00-1.0176-3.8027 2.7845 2.7845 0 00-1.4492-.37305z'
    />
  </svg>
)

/// /////////////////////////////////////////////////////////
// Components

const ButtonComponent: React.FunctionComponent = () => {
  const [color, setColor] = useState<ButtonColor>('primary')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  return (
    <article className='story-article'>
      <h2>Button</h2>
      <p>Custom button component with support for a loading spinner.</p>
      <Button color={color} isLoading={isLoading}>
        Button
      </Button>
      <p>
        Press buttons below to see transitions to their state on the button
        above.
      </p>
      <Button color='primary' onClick={() => setColor('primary')}>
        Primary
      </Button>
      <Button color='accent' onClick={() => setColor('accent')}>
        Accent
      </Button>
      <Button color='warning' onClick={() => setColor('warning')}>
        Warning
      </Button>
      <Button color='danger' onClick={() => setColor('danger')}>
        Danger
      </Button>
      <Button isLoading={true} onClick={() => setIsLoading(!isLoading)}>
        Loading
      </Button>
    </article>
  )
}
const CheckboxComponent: React.FunctionComponent = () => {
  const [checked, setChecked] = useState<boolean>(true)
  return (
    <article className='story-article'>
      <h2>Checkbox</h2>
      <p>
        Custom Checkbox Component. Inputs should always be paired with labels.
        The checkbox and radio components should have their labels displayed
        inline, which can be achieved by adding the .label-inline class to the
        label element.
      </p>
      <label className='label-inline' htmlFor='checked'>
        <Checkbox id='checked' checked={true} onChange={() => undefined} />
        <span>Checked</span>
      </label>
      <label className='label-inline' htmlFor='unchecked'>
        <Checkbox id='unchecked' checked={false} onChange={() => undefined} />
        <span>Unchecked</span>
      </label>
      <label className='label-inline' htmlFor='toggle'>
        <Checkbox
          id='toggle'
          checked={checked}
          onChange={() => setChecked(!checked)}
        />
        <span>Click to toggle</span>
      </label>
    </article>
  )
}

const RadioComponent: React.FunctionComponent = () => {
  const [value, setValue] = useState<number>(1)
  return (
    <article className='story-article'>
      <h2>Radio</h2>
      <p>
        Custom Radio Component. Inputs should always be paired with labels. The
        checkbox and radio components should have their labels displayed inline,
        which can be achieved by adding the .label-inline class to the label
        element.
      </p>
      <label className='label-inline' htmlFor='1'>
        <Radio id='1' checked={value === 1} onChange={() => setValue(1)} />
        <span>One</span>
      </label>
      <label className='label-inline' htmlFor='2'>
        <Radio id='2' checked={value === 2} onChange={() => setValue(2)} />
        <span>Two</span>
      </label>
      <label className='label-inline' htmlFor='3'>
        <Radio id='3' checked={value === 3} onChange={() => setValue(3)} />
        <span>Two</span>
      </label>
    </article>
  )
}

const SelectComponent: React.FunctionComponent = () => {
  const [value, setValue] = useState<number>(1)

  const onSelect = ({ target }: React.ChangeEvent<HTMLSelectElement>): void => {
    setValue(Number(target.value))
  }

  return (
    <article className='story-article'>
      <h2>Select</h2>
      <p>
        Custom Select Component. Should be used as a regular select element with
        option elements as children.
      </p>
      <label className='label' htmlFor='select'>
        <span>One</span>
        <Select id='select' value={value} onChange={onSelect}>
          {options}
        </Select>
      </label>
    </article>
  )
}

const SearchBarComponent: React.FunctionComponent = () => {
  const [needle, setNeedle] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const onSearch: OnSearchCallback = () => {
    setLoading(isLoading => !isLoading)
    action('search')()
  }

  const onNeedleChange: OnNeedleChangeCallback = newNeedle => {
    setNeedle(newNeedle)
  }

  return (
    <article className='story-article'>
      <h2>Search Bar</h2>
      <p>
        The Search Bar component can be treated as an HTML input element but
        comes as a ready form with a submit button and events to simplify the
        onSubmit and onChange events.
      </p>
      <p>Click search to toggle loading</p>
      <SearchBar
        needle={needle}
        onNeedleChange={onNeedleChange}
        onSearch={onSearch}
        isLoading={loading}
      />
      <SearchBar
        needle={needle}
        onNeedleChange={onNeedleChange}
        onSearch={onSearch}
        isLoading={!loading}
      />
    </article>
  )
}

const MenuButtonComponent: React.FunctionComponent = () => {
  return (
    <article className='story-article'>
      <h2>Menu Button</h2>
      <p>
        Intended for use in menus. Acts as a Button HTML element. Styles can be
        applied to the following classes for custom colors:
      </p>
      <ul style={{ listStyle: 'disc', marginLeft: '40px' }}>
        <li>
          <strong>Button: </strong>.menu-button
        </li>
        <li>
          <strong>Icon: </strong>.menu-button {'> <child-class>'}
        </li>
      </ul>
      <p>
        Example style svg child:
        <br />
        <strong>
          {'.menu-button > svg { fill: #336699 } .menu-button:hover > svg,'}
          <br />
          {'.menu-button:focus svg { fill: #fff }'}
        </strong>
        <br />
      </p>
      <MenuButton icon={icon} />
    </article>
  )
}

export const Layout: React.FunctionComponent = () => {
  return (
    <section className='story-section'>
      <article className='story-article'>
        <h1>Input</h1>
        <p>
          Here are examples of custom input elements which can be used
          throughout the application. These components are meant to replace
          their corresponding HTML-elements to apply custom styles and added
          functionality.
        </p>
      </article>
      <ButtonComponent />
      <CheckboxComponent />
      <RadioComponent />
      <SelectComponent />
      <SearchBarComponent />
      <MenuButtonComponent />
    </section>
  )
}
