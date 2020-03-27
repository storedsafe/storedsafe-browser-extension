import React, { useState } from 'react';
import { LoginForm, LogoutForm } from '../../components/Auth';
import { LoginType } from '../../components/Auth/LoginForm';

export default function Auth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const onLogin = (loginType, remember, fields) => {
    console.log(loginType, remember, fields);
    if (loginType === LoginType.YUBIKEY) {
      console.log('Authenticating with YubiKey... (placeholder)');
    }
    if (loginType === LoginType.TOTP) {
      console.log('Authenticating with TOTP... (placeholder)');
    }
    setIsAuthenticated(true);
  };

  const onLogout = () => {
    setIsAuthenticated(false);
  };

  const form = isAuthenticated
    ? <LogoutForm onLogout={onLogout} />
    : <LoginForm onLogin={onLogin} />;

  return (
    <section className="card">
      {form}
    </section>
  );
}
