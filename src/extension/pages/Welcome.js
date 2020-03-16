import React from 'react';

export default function Welcome(props) {
  return (
    <section>
      <h1>Welcome</h1>
      <form>
        <label>Site <input type="text" /></label>
        <label>API Key <input type="text" /></label>
        <label>Autofill <input type="check" /></label>
      </form>
    </section>
  );
}
