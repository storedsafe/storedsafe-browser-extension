import React, { useState, createContext } from 'react';
import { Banner } from '../Layout';
import { PopupMain } from './PopupMain';
import './Popup.scss';

const PageContext = createContext({
  pages: [],
  addPage: (page: React.ReactNode) => { return }, // eslint-disable-line
  popPage: () => { return }
});

export const Popup: React.FunctionComponent = () => {
  const [pages, setPages] = useState<React.ReactNode[]>([]);

  const addPage = (page: React.ReactNode): void => {
    setPages([...pages, page]);
  };

  const popPage = (): void => {
    setPages(pages.slice(0, -1));
  };

  const page = pages.length > 0 ? pages[pages.length - 1] : undefined;

  return (
    <section className="popup">
      <header>
        <Banner />
      </header>
      <section className="popup-content">
        <PageContext.Provider value={{ pages, addPage, popPage }}>
          {page === undefined && <PopupMain />}
          {page && page}
        </PageContext.Provider>
      </section>
    </section>
  );
};
