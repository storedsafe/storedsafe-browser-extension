import React, { useState, useEffect } from 'react';
import Message from '../../utils/Message';
import { LoginForm, LogoutForm } from '../../components/Auth';
import Loading from '../../components/Loading';

export default function Auth() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Message.getToken().then(({ token: savedToken }) => {
      setToken(savedToken);
    });
  }, []);

  const onLogin = (loginType, remember, fields) => {
    setIsLoading(true);
    setError(null);
    Message.login({
      loginType,
      remember,
      fields,
    }).then((response) => {
      setIsLoading(false);
      if (response.status === 200) {
        setToken(response.data.CALLINFO.token);
      } else {
        setError(response.data.ERRORS[0]);
      }
    }).catch((errorMessage) => {
      setIsLoading(false);
      setError(errorMessage);
    });
  };

  const onLogout = () => {
    setIsLoading(true);
    setError(null);
    Message.logout().then(() => {
      setIsLoading(false);
      setToken(null);
    }).catch((errorMessage) => {
      setIsLoading(false);
      setError(errorMessage);
    });
  };

  const form = token !== null
    ? <LogoutForm onLogout={onLogout} />
    : <LoginForm onLogin={onLogin} />;

  const errorMessage = error === null
    ? null
    : <p className="error">{error}</p>;

  return (
    <section className="card">
      {token !== null && <p>{token}</p>}
      {form}
      {isLoading && <Loading />}
      {errorMessage}
    </section>
  );
}
