import React from 'react'
import './TopMenu.scss'

const icon = (
  <svg
    width='40'
    height='40'
    version='1.1'
    viewBox='0 0 10.583 10.583'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='m7.1231.39901a3.0579 3.0579 0 00-3.0546 3.0579 3.0579 3.0579 0 00.56619 1.7722 3.0579 3.0579 0 000 .0004778l-4.2357 4.2352.71957.71956 4.2352-4.2352a3.0579 3.0579 0 001.7726.56571 3.0579 3.0579 0 003.0579-3.0579 3.0579 3.0579 0 00-3.0579-3.0579 3.0579 3.0579 0 00-.00334 0zm-.029146.89635a2.1616 2.1616 0 01.03249 0 2.1616 2.1616 0 012.1616 2.1616 2.1616 2.1616 0 01-2.1616 2.1616 2.1616 2.1616 0 01-2.1616-2.1616 2.1616 2.1616 0 012.1291-2.1616z' />
  </svg>
)

export type OnNeedleChangeCallback = (needle: string) => void
export type OnSearchCallback = () => void

export interface TopMenuProps {
  needle: string
  onFocus?: () => void
  onBlur?: () => void
  onNeedleChange: OnNeedleChangeCallback
  onSearch: OnSearchCallback
  disabled?: boolean
  isLoading: boolean
}

export const TopMenu: React.FunctionComponent<TopMenuProps> = ({
  needle,
  onNeedleChange,
  onSearch,
  onFocus,
  onBlur,
  disabled,
  isLoading
}: TopMenuProps) => {
  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onSearch()
  }

  return (
    <form
      className={`top-menu${disabled ? ' disabled' : ''}`}
      onSubmit={onSubmit}
    >
      <input
        className='search-bar-input'
        type='search'
        value={needle}
        placeholder='Search'
        title='Search'
        aria-label='Search Text'
        disabled={disabled}
        onChange={({ target }: React.ChangeEvent<HTMLInputElement>): void => {
          onNeedleChange(target.value)
        }}
        onFocus={(): void => onFocus?.()}
        onBlur={(): void => onBlur?.()}
      />
      <button
        className={`search-bar-button${isLoading ? ' loading' : ''}`}
        type='submit'
        aria-label='Search Submit'
        title='Search'
        disabled={disabled}
      >
        {icon}
      </button>
    </form>
  )
}

TopMenu.defaultProps = {
  disabled: false
}
