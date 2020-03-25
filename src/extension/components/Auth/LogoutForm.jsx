import React from 'react';
import PropTypes from 'prop-types';

function LogoutForm({ onLogout }) {
  const onSubmit = (event) => {
    event.preventDefault();
    onLogout();
  };

  return (
    <form className="logout" onSubmit={onSubmit}>
      <input type="submit" value="Logout from StoredSafe" />
    </form>
  );
}

LogoutForm.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default LogoutForm;
