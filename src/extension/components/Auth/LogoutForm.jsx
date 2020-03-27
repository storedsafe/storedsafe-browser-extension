import React from 'react';
import PropTypes from 'prop-types';
import Input from '../Input';

function LogoutForm({ onLogout }) {
  const onSubmit = (event) => {
    event.preventDefault();
    onLogout();
  };

  return (
    <form className="logout" onSubmit={onSubmit}>
      <Input type="submit" name="submit" title="Logout from StoredSafe" />
    </form>
  );
}

LogoutForm.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default LogoutForm;
