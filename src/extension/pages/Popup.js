import React, { useState, useEffect } from 'react';

export default function Popup(props) {
  const [token, setToken] = useState(null);
  const [fields, setFields] = useState(null);

  const onSubmit = (event) => {
    event.preventDefault();
    setToken(event.target.token.value);
  };

  const handleMessage = (request, sender) => {
    setFields(Object.keys(request.fields).map(key => {
      if (/pass/.test(key)) {
        return <li key={key}>{request.fields[key].replace(/./g,'*')}</li>;
      }
      return <li key={key}>{request.fields[key]}</li>;
    }));
  };

  useEffect(() => {
    browser.runtime.onMessage.addListener(handleMessage);
  }, []);

  useEffect(() => {
    browser.storage.local.get('token')
      .then(values => {
        if(values.token !== undefined) {
          setToken(values.token.value);
        }
      });
  }, []);

  useEffect(() => {
    browser.storage.local.set({
      token: {
        value: token,
        lastRefresh: Date.now(),
      },
    });
  }, [token]);

  return (
    <section>
      <p>Token: {token}</p>
      <form onSubmit={onSubmit}>
        <input type="text" name="token" id="token" />
        <input type="submit" />
      </form>
      <ul>
        {fields}
      </ul>
    </section>
  );
}
