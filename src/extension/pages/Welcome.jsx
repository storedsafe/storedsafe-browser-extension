import React from 'react';

export default function Welcome() {
  return (
    <section class="card">
      <h1>Welcome</h1>
      <form>
        <label htmlFor="site">
          <span>Site</span>
          <input type="text" id="site" />
        </label>
        <label htmlFor="apikey">
          <span>API Key</span>
          <input type="text" id="apikey" />
        </label>
        <label htmlFor="autofill">
          <span>Autofill</span>
          <input type="check" id="autofill" />
        </label>
      </form>
    </section>
  );
}
