import React from 'react';
import logo from './logo.png';
import './Logo.scss';

export const Logo: React.FunctionComponent = () => (
  <img src={logo} alt="StoredSafe" className="logo" />
);
