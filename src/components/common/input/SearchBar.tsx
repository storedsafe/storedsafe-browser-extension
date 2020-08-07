import React from 'react'
import './SearchBar.scss'
import { MenuButton } from './MenuButton'
import { icons } from '../layout'

type SearchInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export type OnNeedleChangeCallback = (needle: string) => void
export type OnSearchCallback = () => void

export interface SearchBarProps extends SearchInputProps {
  needle: string
  onNeedleChange: OnNeedleChangeCallback
  onSearch: OnSearchCallback
  disabled?: boolean
  isLoading: boolean
}

export const SearchBar: React.FunctionComponent<SearchBarProps> = ({
  needle,
  onNeedleChange,
  onSearch,
  disabled,
  isLoading,
  ...props
}: SearchBarProps) => {
  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onSearch()
  }
  return (
    <section className='search-bar'>
      <form
        className={`search-form${disabled ? ' disabled' : ''}`}
        onSubmit={onSubmit}
      >
        <input
          placeholder={disabled ? '' : 'Search'}
          title={disabled ? '' : 'Search'}
          aria-label='Search Text'
          {...props}
          className='search-bar-input'
          type='search'
          value={needle}
          disabled={disabled}
          onChange={({ target }: React.ChangeEvent<HTMLInputElement>): void => {
            onNeedleChange(target.value)
          }}
        />
        <MenuButton
          className={`search-button${isLoading ? ' loading' : ''}`}
          type='submit'
          aria-label='Search Submit'
          title={disabled ? '' : 'Search'}
          disabled={disabled}
          icon={icons.search}
        />
      </form>
    </section>
  )
}

SearchBar.defaultProps = {
  disabled: false
}
