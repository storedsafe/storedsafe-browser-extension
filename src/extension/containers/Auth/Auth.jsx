import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Message from '../../lib/Message';
import { LoginForm, LogoutForm } from '../../components/Auth';
import Loading from '../../components/Loading';

function Auth({ setAuthenticated }) {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Message.getToken().then(({ token: savedToken }) => {
      setToken(savedToken);
      setAuthenticated(savedToken !== null);
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
        setAuthenticated(true);
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
      setAuthenticated(false);
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
      {form}
      {isLoading && <Loading />}
      {errorMessage}
    </section>
  );
}

Auth.propTypes = {
  setAuthenticated: PropTypes.func.isRequired,
};

export default Auth;
