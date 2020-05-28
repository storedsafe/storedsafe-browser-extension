import React, { useState } from 'react';
import { Banner, MenuButton, LoadingComponent } from '../common';
import { SearchBar } from '../Search';
import { StatusBar } from './StatusBar';
import Search, { SearchProps } from './Search';
import { OnNeedleChangeCallback, OnSearchCallback } from '../Search';
import Auth, { AuthProps } from './Auth';
import svg from '../../ico/svg';
import './Popup.scss';

enum Page {
  Search,
  Sessions,
  Add,
}

interface PopupProps {
  isInitialized: boolean;
  auth: AuthProps;
  search: SearchProps & {
    needle: string;
    onNeedleChange: OnNeedleChangeCallback;
    onSearch: OnSearchCallback;
  };
  openOptions: () => void;
}

export const Popup: React.FunctionComponent<PopupProps> = ({
  isInitialized,
  auth,
  search,
  openOptions,
}: PopupProps) => {
  const [page, setPage] = useState<Page>();

  const { sessions } = auth;
  const { needle } = search;

  const isOnline = Object.keys(sessions).length > 0;

  if (isInitialized && page === undefined) {
    if (isOnline) {
      setPage(Page.Search);
    } else {
      setPage(Page.Sessions);
    }
  }

  return (
    <section className="popup">
      <header className="popup-header">
        <Banner />
        <article className="popup-search-bar">
          <SearchBar
            {...search}
            disabled={!isOnline}
            onFocus={(): void => setPage(Page.Search)}
          />
        </article>
      </header>
      <section className="popup-main">
        <section className="popup-content">
          {page === Page.Add && <p>Not yet implemented</p>}
          {page === Page.Search && <Search key={needle} { ...search } />}
          {page === Page.Sessions && <Auth { ...auth } />}
          {page === undefined && <LoadingComponent />}
        </section>
        {isInitialized && (
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
        )}
      </section>
      <section className="popup-status">
        <StatusBar
          activeSessions={Object.keys(sessions).length}
        />
      </section>
    </section>
  );
};
