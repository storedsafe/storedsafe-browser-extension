import React from 'react';
import svg from '../../../ico/svg';
import './SearchBar.scss';

export interface SearchBarProps {
  needle: string;
  onChange: (needle: string) => void;
  onSearch: (needle: string) => void;
}

export const SearchBar: React.FunctionComponent<SearchBarProps> = ({
  needle,
  onChange,
  onSearch,
}: SearchBarProps) => {
  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSearch(needle);
  };

  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <label className="search-bar-label">
        <span className="search-bar-title">Search</span>
        <div className="search-bar-area">
          <input
            className="search-bar-input"
            type="search"
            value={needle}
            onChange={({ target }: React.ChangeEvent<HTMLInputElement>): void => {
              onChange(target.value)
            }}
          />
          <button className="search-bar-button" type="submit">
            {svg.search}
          </button>
        </div>
      </label>
    </form>
  );
}
