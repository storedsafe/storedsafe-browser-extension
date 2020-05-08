import React from 'react';
import { Banner } from '../UI';
import './Popup.scss';

export const Popup: React.FunctionComponent = () => {
  return (
    <section className="popup">
      <Banner>
      </Banner>
      Popup with banner
    </section>
  );
};
