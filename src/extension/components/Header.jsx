import React from 'react';
import logo from '../../assets/logo.png';
import './Header.scss';

export default function Header() {
  return (
    <header>
      <img src={logo} alt="StoredSafe" />
    </header>
  );
}
