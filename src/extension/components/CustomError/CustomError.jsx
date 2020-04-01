import React from 'react';
import PropTypes from 'prop-types';

function CustomError({ message }) {
  return (
    <p className="error">{message}</p>
  );
}

CustomError.propTypes = {
  message: PropTypes.string.isRequired,
};

export default CustomError;
