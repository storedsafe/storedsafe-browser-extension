import React, { useState, useEffect } from 'react';
import Auth from '../containers/Auth';
import logo from '../../assets/logo.png';
import './Popup.scss';

export default function Popup(props) {
  return (
    <section className="popup">
      <header><img src={logo} alt="StoredSafe" /></header>
      <section className="login">
        <select>
          <option>YubiKey</option>
          <option>TOTP</option>
        </select>
        <form>
          <label for="username">Username or e-mail</label>
          <input
            type="text"
            name="username"
            id="username" />
          <ul className="login-type">
            <li key="yubikey">
              <label for="passphrase">Passphrase + YubiKey</label>
              <input
                type="password"
                name="passphrase"
                id="passphrase" />
            </li>
            <li key="totp">
              <label for="passphrase">Passphrase</label>
              <input
                type="password"
                name="passphrase"
                id="passphrase" />
              <label for="otp">OTP</label>
              <input
                type="text"
                name="OTP"
                id="OTP" />
            </li>
          </ul>
          <label for="rememberUsername">
            <input
              type="checkbox"
              name="rememberUsername"
              id="rememberUsername" />
            Remember Username
          </label>
          <input type="submit" value="Login to StoredSafe" />
        </form>
      </section>
      <section className="list">
        <input type="text" placeholder="Search" />
        <ul>
          <li className="vault">
            My Vault
            <ul>
              <li className="object">
                safe.storedsafe.com
                <ul>
                  <li className="field">
                    <span className="key">Username: </span>
                    <span className="value">john.doe@example.com</span>
                  </li>
                  <li className="field crypted">
                    <span className="key">Passphase: </span>
                    <span className="value">****************</span>
                    <div className="button">Copy</div><div className="button">Reveal</div>
                  </li>
                </ul>
                <li className="object">Safe PIN</li>
                <ul>
                  <li className="field crypted">
                    <span className="key">Pin: </span>
                    <span className="value">******</span>
                    <div className="button">Copy</div><div className="button">Reveal</div>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </section>
      <section className="save">
      </section>
      <section className="logout">
        <button>Logout from StoredSafe</button>
      </section>
    </section>
  );
}
