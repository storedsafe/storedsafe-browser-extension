import React, { useState } from 'react';
import { Banner, Button } from '../common';
import { Sites } from './Sites';
import { GeneralSettings } from './GeneralSettings';
import './Options.scss';

export const Options: React.FunctionComponent = () => {
  const [clearLoading, setClearLoading] = useState<boolean>(false);

  function clearData() {
    setClearLoading(true);
    Promise.all([
      browser.storage.local.clear(),
      browser.storage.sync.clear(),
    ]).then(() => {
      setClearLoading(false);
    });
  }

  return (
    <section className="options">
      <header>
        <Banner />
      </header>
      <section className="options-content">
        <h1>Options</h1>
        <article className="options-article card">
          <header className="options-article-header">
            <h2>General</h2>
          </header>
          <GeneralSettings />
        </article>
        <article className="options-article card">
          <header className="options-article-header">
            <h2>Sites</h2>
          </header>
          <Sites />
        </article>
        <article className="options-article card">
          <header className="options-article-header">
            <h2>Clear data</h2>
          </header>
          <Button
            className="options-clear-data"
            type="button"
            color="warning"
            onClick={clearData}
            isLoading={clearLoading}>
            Clear all data
          </Button>
        </article>
      </section>
    </section>
  );
};
