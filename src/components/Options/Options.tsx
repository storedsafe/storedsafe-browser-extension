import React from 'react';
import { Banner } from '../common';
import { Sites } from './Sites';
import { GeneralSettings } from './GeneralSettings';
import './Options.scss';

export const Options: React.FunctionComponent = () => {
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
      </section>
    </section>
  );
};
