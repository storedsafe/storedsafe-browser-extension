import React, { Fragment } from 'react';
import { action } from '@storybook/addon-actions';
import { Site } from '../model/Sites';
import { Sessions } from '../model/Sessions';
import * as Auth from '../components/Auth';

export default {
  title: 'Auth',
}

const sites: Site[] = [
  {
    url: 'foo.example.com',
    apikey: 'fooapikey',
  },
  {
    url: 'bar.example.com',
    apikey: 'barapikey',
  },
  {
    url: 'reallylongsubdomain.reallyreallyreallyreallyreallyreallyreallyreallylongdomainname.reallylongparttld.reallylongtld',
    apikey: 'reallylongapikey',
  },
];

const sessions: Sessions = {
  'bar.example.com': {
    apikey: 'barapikey',
    token: 'bartoken',
    createdAt: Date.now() - Math.floor(Math.random() * 60000),
    violations: { 'BAR_VIOLATION': 'Maximum number of users exceeded' },
    warnings: { 'BAR_WARNING': 'Weak passwords detected' },
  },
  'reallylongsubdomain.reallyreallyreallyreallyreallyreallyreallyreallylongdomainname.reallylongparttld.reallylongtld': {
    apikey: 'reallylongapikey',
    token: 'reallylongtoken',
    createdAt: Date.now() - Math.floor(Math.random() * 60000),
    violations: { 'REALLYLONG_VIOLATION': 'Maximum number of users exceeded' },
    warnings: { 'REALLYLONG_WARNING': 'Weak passwords detected' },
  },
};

export const SiteItem: React.FunctionComponent = () => {
  return (
    <Fragment>
      {sites.map(({ url }) => (
        <Auth.SiteTitle
          key={url}
          url={url}
          session={sessions[url]}
        />
      ))}
    </Fragment>
  );
};
