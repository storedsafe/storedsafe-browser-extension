import React from 'react';
import svg from '../../ico/svg';
import './SearchBar.scss';

export type OnNeedleChangeCallback = (needle: string) => void;
export type OnSearchCallback = () => void;

export interface SearchBarProps {
  needle: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onNeedleChange: OnNeedleChangeCallback;
  onSearch: OnSearchCallback;
  disabled?: boolean;
  isLoading: boolean;
}

export const SearchBar: React.FunctionComponent<SearchBarProps> = ({
  needle,
  onNeedleChange,
  onSearch,
  onFocus,
  onBlur,
  disabled,
  isLoading,
}: SearchBarProps) => {
  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form className={`search-bar${disabled ? ' disabled' : ''}`} onSubmit={onSubmit}>
      <input
        className="search-bar-input"
        type="search"
        value={needle}
        placeholder="Search"
        aria-label="Search Text"
        disabled={disabled}
        onChange={({ target }: React.ChangeEvent<HTMLInputElement>): void => {
          onNeedleChange(target.value)
        }}
        onFocus={(): void => onFocus && onFocus()}
        onBlur={(): void => onBlur && onBlur()}
      />
      <button
        className={`search-bar-button${isLoading ? ' loading' : ''}`}
        type="submit"
        aria-label="Search Submit"
        disabled={disabled}>
        {svg.search}
      </button>
    </form>
  );
}

SearchBar.defaultProps = {
  disabled: false,
};
