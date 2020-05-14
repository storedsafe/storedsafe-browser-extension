import React from 'react';
import { Banner } from '../common';
import './Popup.scss';

interface PopupProps {
  menu: React.ReactNode;
  content: React.ReactNode;
  status: React.ReactNode;
}

export const Popup: React.FunctionComponent<PopupProps> = ({
  menu,
  content,
  status,
}: PopupProps) => (
  <section className="popup">
    <header className="popup-header">
      <Banner />
      <section className="popup-menu">
        {menu}
      </section>
    </header>
    <section className="popup-content">
      {content}
    </section>
    <section className="popup-status">
      {status}
    </section>
  </section>
);
