import React, { useState } from 'react';
import { Banner, MenuButton, LoadingComponent } from '../common';
import { SearchBar } from '../Search';
import { StatusBar } from './StatusBar';
import Search, { SearchProps } from './Search';
import Auth, { AuthProps } from './Auth';
import svg from '../../../ico/svg';
import './Popup.scss';

enum Page {
  Search,
  Sessions,
  Add,
}

interface PopupSearchProps extends SearchProps {
  onNeedleChange?: (newNeedle: string) => void;
  onSearch: (needle: string) => void;
}

interface PopupProps {
  isLoading: boolean;
  search: PopupSearchProps;
  auth: AuthProps;
  openOptions: () => void;
}

export const Popup: React.FunctionComponent<PopupProps> = ({
  isLoading,
  search,
  auth,
  openOptions,
}: PopupProps) => {
  const [needle, setNeedle] = useState<string>('');
  const [page, setPage] = useState<Page>();

  const { sessions } = auth;
  const { onNeedleChange, onSearch } = search;

  const isOnline = Object.keys(sessions).length > 0;

  if (!isLoading && page === undefined) {
    if (isOnline) {
      setPage(Page.Search);
    } else {
      setPage(Page.Sessions);
    }
  }

  const handleNeedleChange = (newNeedle: string): void => {
    setNeedle(newNeedle);
    onNeedleChange && onNeedleChange(newNeedle);
  };

  return (
    <section className="popup">
      <header className="popup-header">
        <Banner />
        <article className="popup-search-bar">
          <SearchBar
            needle={needle}
            onChange={handleNeedleChange}
            onSearch={(): void => onSearch(needle)}
            disabled={!isOnline}
            onFocus={(): void => setPage(Page.Search)}
          />
        </article>
      </header>
      <section className="popup-main">
        <section className="popup-content">
          {page === Page.Search && <Search key={needle} { ...search } />}
          {page === Page.Sessions && <Auth { ...auth } />}
          {page === undefined && <LoadingComponent />}
        </section>
        <ul className="popup-menu">
          {isOnline && (
            <li>
              <MenuButton
                icon={svg.add}
                title="Add New Object"
                onClick={(): void => setPage(Page.Add)}
                selected={page === Page.Add}
              />
            </li>
          )}
          <li>
            <MenuButton
              icon={svg.vault}
              title="Sessions"
              onClick={(): void => setPage(Page.Sessions)}
              selected={page === Page.Sessions}
            />
          </li>
          <li>
            <MenuButton
              icon={svg.settings}
              title="Options"
              onClick={openOptions}
            />
          </li>
        </ul>
      </section>
      <section className="popup-status">
        <StatusBar
          activeSessions={Object.keys(sessions).length}
        />
      </section>
    </section>
  );
};
