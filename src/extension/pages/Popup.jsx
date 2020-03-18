import React, { useState, useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import FilterableVaultList from '../components/FilterableVaultList';
import SaveLoginForm from '../components/SaveLoginForm';
import logo from '../../assets/logo.png';
import './Popup.scss';

export default function Popup(props) {
  return (
    <section className="popup">
      <header><img src={logo} alt="StoredSafe" /></header>
      <FilterableVaultList />
      <SaveLoginForm />
      <AuthForm />
    </section>
  );
}
