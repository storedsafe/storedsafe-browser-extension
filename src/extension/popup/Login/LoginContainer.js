import React, { useState } from 'react';
import Login from './Login';

export default function LoginContainer(props) {
  // async function onSubmit(event) {
    // event.preventDefault();

    // const username = event.target.username.value;
    // const password = event.target.password.value;
    // const otp = event.target.otp.value;

    // const storage = await browser.storage.local.get(['site', 'apikey'])

    // fetch(`${storage.site}/api/1.0/auth/`, {
      // method: 'POST',
      // body: JSON.stringify({
        // username: username,
        // passphrase: password,
        // otp: otp,
        // logintype: 'totp',
        // apikey: storage.apikey,
      // })
    // }).then(res => res.json())
      // .then(data => {
        // const token = data.CALLINFO.token;
        // console.log(token);
        // browser.storage.local.set({token: token });
        // props.onLogIn();
      // })
      // .catch(error => console.error(error));
  // }

  function onSubmit(event) {
    event.preventDefault();

    const username = event.target.username.value;
    const password = event.target.password.value;
    const otp = event.target.otp.value;

    browser.storage.local.get(['site', 'apikey'])
      .then(storage => {
        fetch(`https://${storage.site}/api/1.0/auth/`, {
          method: 'POST',
          body: JSON.stringify({
            username: username,
            passphrase: password,
            otp: otp,
            logintype: 'totp',
            apikey: storage.apikey,
          })
        }).then(res => res.json())
          .then(data => {
            const token = data.CALLINFO.token;
            console.log(token);
            browser.storage.local.set({token: token });
            props.onLogIn();
          })
          .catch(error => console.error(error));
      })
  }

  return <Login onSubmit={onSubmit} />;
}
