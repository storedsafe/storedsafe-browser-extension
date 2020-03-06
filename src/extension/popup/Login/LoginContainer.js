import React, { useState } from 'react';
import Login from '../components/Login';

export default function LoginContainer(props) {
  function onSubmit(event) {
    event.preventDefault();

    // TODO: Implement authentication request
    console.log(event.target.value);

    // if successful
    props.onLogIn();
  }

  return <Login onSubmit={onSubmit} />;
}
