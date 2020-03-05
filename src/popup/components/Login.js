import React, { useState } from 'react';

export default function Login(props) {
  return (
    <form onSubmit={props.onSubmit}>
      <label htmlFor="username">Username:</label>
      <input type="text" name="username" id="username" />
      <label htmlFor="password">Password:</label>
      <input type="password" name="password" id="password" />
      <label htmlFor="otp">OTP:</label>
      <input type="text" name="otp" id="otp" />

      <input type="checkbox" name="remember" id="remember" />
      <label for="remember">Remember username</label>

      <input type="submit" value="Log In" />
    </form>
  );
}

