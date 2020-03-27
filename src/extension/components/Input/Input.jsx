/* eslint react/jsx-props-no-spreading: 0 */
import React from 'react';
import PropTypes from 'prop-types';

function Input({
  title,
  type,
  name,
  children,
  ...attrs
}) {
  if (type === 'checkbox') {
    return (
      <label htmlFor={name} className={type}>
        <span>{title}</span>
        <input
          type={type}
          name={name}
          id={name}
          {...attrs}
        />
        <span className="checkmark" />
      </label>
    );
  }

  if (type === 'select') {
    return (
      <label htmlFor={name} className={type}>
        <span>{title}</span>
        <div>
          <select
            name={name}
            id={name}
            {...attrs}
          >
            {children}
          </select>
        </div>
      </label>
    );
  }

  if (type === 'button' || type === 'submit') {
    return (
      <input
        className={type}
        type={type}
        name={name}
        id={name}
        value={title}
        {...attrs}
      />
    );
  }

  if (type === 'textarea') {
    return (
      <label htmlFor={name} className={type}>
        <span>{title}</span>
        <textarea
          name={name}
          id={name}
          {...attrs}
        />
      </label>
    );
  }

  return (
    <label htmlFor={name} className={type}>
      <span>{title}</span>
      <input
        type={type}
        name={name}
        id={name}
        {...attrs}
      />
    </label>
  );
}

Input.defaultProps = {
  children: null,
};

Input.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default Input;
