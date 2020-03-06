import React, { useState } from 'react';
import Login from './Login';

export default function LoginContainer(props) {
  function onSubmit(event) {
    event.preventDefault();

    const username = event.target.username.value;
    const password = event.target.password.value;
    const otp = event.target.otp.value;

    console.log(username, password, otp);

    props.onLogIn();
  }

  return <Login onSubmit={onSubmit} />;
}
