import React from 'react';
import { Banner } from '../common';
import './Popup.scss';

interface PopupProps {
  menu: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
  status: React.ReactNode;
}

export const Popup: React.FunctionComponent<PopupProps> = ({
  menu,
  left,
  right,
  status,
}: PopupProps) => (
  <section className="popup">
    <Banner />
    <section className="popup-menu">
      {menu}
    </section>
    <section className="popup-left">
      {left}
    </section>
    <section className="popup-right">
      {right}
    </section>
    <section className="popup-status">
      {status}
    </section>
  </section>
);
