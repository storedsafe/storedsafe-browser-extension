import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import LogoutForm from '../components/Auth/LogoutForm';

export default function Auth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const onLogin = (loginType, remember, fields) => {
    console.log(loginType, remember, fields);
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
