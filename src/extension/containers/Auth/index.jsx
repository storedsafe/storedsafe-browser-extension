import React, { useState } from 'react';
import { LoginForm, LogoutForm } from '../../components/Auth';
import Message from '../../utils/Message';

export default function Auth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const onLogin = (loginType, remember, fields) => {
    Message.login({
      loginType,
      remember,
      fields,
    }).then(() => {
      setIsAuthenticated(true);
    }).catch((error) => {
      console.log('Logout failed', error);
    });
  };

  const onLogout = () => {
    Message.logout().then(() => {
      setIsAuthenticated(false);
    }).catch((error) => {
      console.log('Logout failed', error);
    });
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
