import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { usePromise } from '../../hooks/CustomHooks';
import Message from '../../lib/Message';
import { LoginForm, LogoutForm } from '../../components/Auth';
import Loading from '../../components/Loading';
import CustomError from '../../components/CustomError';

function Auth({ children }) {
  const { value: isAuthenticated, resolve, isLoading, error } = usePromise();

  // Get initial state
  useEffect(() => {
    resolve(
      Message.getToken().then(({ token }) => (
        token !== null
      )),
    );
  }, []);

  const onLogin = (loginType, remember, fields) => {
    resolve(
      Message.login({
        loginType,
        remember,
        fields,
      }).then((response) => {
        if (response.status === 200) {
          return response.data.CALLINFO.token !== null;
        }
        throw new Error(response.data.ERRORS[0]);
      }),
    );
  };

  const onLogout = () => {
    resolve(
      Message.logout().then(() => (false)),
    );
  };

  return (
    <section className="card">
      {
        isAuthenticated
          ? [
            children,
            <LogoutForm key="logoutForm" onLogout={onLogout} />,
          ]
          : <LoginForm key="loginForm" onLogin={onLogin} />
      }
      {isLoading && <Loading />}
      {error !== null && <CustomError message={error.toString()} />}
    </section>
  );
}

Auth.defaultProps = {
  children: null,
};

Auth.propTypes = {
  children: PropTypes.node,
};

export default Auth;
