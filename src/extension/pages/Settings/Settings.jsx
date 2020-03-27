import React from 'react';
import Input from '../../components/Input';
import Header from '../../components/Header';

export default function Settings() {
  return (
    <div className="settings">
      <Header />
      <section className="card">
        <h1>Settings</h1>
        <form>
          <Input
            type="text"
            name="site"
            title="Site"
          />
          <Input
            type="text"
            name="apikey"
            title="API Key"
          />
          <Input
            type="checkbox"
            name="autofill"
            title="Autofill"
          />
        </form>
      </section>
    </div>
  );
}
