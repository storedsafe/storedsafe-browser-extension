import React from 'react';
import svg from '../../../ico/svg';
import './SearchBar.scss';

export interface SearchBarProps {
  needle: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange: (needle: string) => void;
  onSearch: (needle: string) => void;
  disabled?: boolean;
}

export const SearchBar: React.FunctionComponent<SearchBarProps> = ({
  needle,
  onChange,
  onSearch,
  onFocus,
  onBlur,
  disabled,
}: SearchBarProps) => {
  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSearch(needle);
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
          onChange(target.value)
        }}
        onFocus={(): void => onFocus && onFocus()}
        onBlur={(): void => onBlur && onBlur()}
      />
      <button className="search-bar-button" type="submit" aria-label="Search Submit" disabled={disabled}>
        {svg.search}
      </button>
    </form>
  );
}

SearchBar.defaultProps = {
  disabled: false,
};
