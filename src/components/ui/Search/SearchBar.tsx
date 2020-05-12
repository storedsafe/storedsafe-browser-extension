import React from 'react';
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
            <svg className="search-bar-icon" width="40" height="40" version="1.1" viewBox="0 0 10.583 10.583" xmlns="http://www.w3.org/2000/svg"><path transform="scale(.26458)" d="m27.486 0a12.5 12.5 0 00-12.486 12.5 12.5 12.5 0 002.3145 7.2441 12.5 12.5 0 000 .001953l-17.314 17.312 2.9414 2.9414 17.312-17.312a12.5 12.5 0 007.2461 2.3125 12.5 12.5 0 0012.5-12.5 12.5 12.5 0 00-12.5-12.5 12.5 12.5 0 00-.013672 0zm-.11914 3.6641a8.8361 8.8361 0 01.13281 0 8.8361 8.8361 0 018.8359 8.8359 8.8361 8.8361 0 01-8.8359 8.8359 8.8361 8.8361 0 01-8.8359-8.8359 8.8361 8.8361 0 018.7031-8.8359z"/></svg>
          </button>
        </div>
      </label>
    </form>
  );
}
