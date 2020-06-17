import React, { Fragment, useState, useEffect } from 'react';
import { Banner, MenuButton, LoadingComponent } from '../common';
import { SearchBar } from '../Search';
import { StatusBar } from './StatusBar';
import { OnNeedleChangeCallback, OnSearchCallback } from '../Search';
import Search, { SearchProps } from './Search';
import Auth, { AuthProps } from './Auth';
import Add, { AddProps } from './Add';
import svg from '../../ico/svg';
import './Popup.scss';

enum Page {
  Search,
  Sessions,
  Add,
}

interface PopupProps {
  isInitialized: boolean;
  add: AddProps;
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
  add,
  auth,
  search,
  openOptions,
}: PopupProps) => {
  const [page, setPage] = useState<Page>();

  const { sessions } = auth;
  const isOnline = sessions.size > 0;

  if (isInitialized && page === undefined) {
    if (isOnline) {
      if (add.values) {
        setPage(Page.Add);
      } else {
        setPage(Page.Search);
      }
    } else {
      setPage(Page.Sessions);
    }
  }

  useEffect(() => {
    if (add.values) {
      setPage(Page.Add);
    }
  }, [add.values]);

  const menu = isInitialized ? (
    <ul className={"popup-menu"}>
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
  ) : null;

  const isLoading = Object.values(search.searchStatus).reduce((loading, status) => {
    return loading || status.loading;
  }, false);

  return (
    <section className="popup">
      <header className="popup-header">
        <h1><Banner /></h1>
        <article className="popup-search-bar">
          <SearchBar
            {...search}
            disabled={!isOnline}
            onFocus={(): void => setPage(Page.Search)}
            isLoading={isLoading}
          />
        </article>
      </header>
      {page === undefined ? (
        <LoadingComponent />
        ) : (
          <section className="popup-main">
            <section className="popup-content">
              {page === Page.Add && <Add { ...add } />}
              {page === Page.Search && <Search { ...search } />}
              {page === Page.Sessions && <Auth { ...auth } />}
            </section>
            {menu}
          </section>
      )}
      <section className="popup-status">
        <StatusBar
          activeSessions={sessions.size}
        />
        {Object.keys(search.searchStatus).map((host) => (
          <Fragment key={host}>
            {search.searchStatus[host].loading && <p>Searching {host}...</p>}
            {search.searchStatus[host].error && (
              <p className="danger">
                {host}: {search.searchStatus[host].error}
              </p>
            )}
          </Fragment>
        ))}
      </section>
    </section>
  );
};
