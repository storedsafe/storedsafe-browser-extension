import React from 'react';
import Header from '../components/Header';
import Auth from '../containers/Auth';
import './Popup.scss';

export default function Popup() {
  return (
    <div className="popup">
      <Header />
      <Auth />
    </div>
  );
}
