import React, { Fragment } from 'react';
import * as Auth from '../components/Auth';

export default {
  title: 'Auth',
}

const sites: Site[] = [
  {
    host: 'foo.example.com',
    apikey: 'fooapikey',
  },
  {
    host: 'bar.example.com',
    apikey: 'barapikey',
  },
  {
    host: 'reallylongsubdomain.reallyreallyreallyreallyreallyreallyreallyreallylongdomainname.reallylongparttld.reallylongtld',
    apikey: 'reallylongapikey',
  },
];

const sessions: Sessions = new Map([
  ['bar.example.com', {
    token: 'bartoken',
    createdAt: Date.now() - Math.floor(Math.random() * 60000),
    violations: { 'BAR_VIOLATION': 'Maximum number of users exceeded' },
    warnings: { 'BAR_WARNING': 'Weak passwords detected' },
    timeout: 0,
  }],
  ['reallylongsubdomain.reallyreallyreallyreallyreallyreallyreallyreallylongdomainname.reallylongparttld.reallylongtld', {
    apikey: 'reallylongapikey',
    token: 'reallylongtoken',
    createdAt: Date.now() - Math.floor(Math.random() * 60000),
    violations: { 'REALLYLONG_VIOLATION': 'Maximum number of users exceeded' },
    warnings: { 'REALLYLONG_WARNING': 'Weak passwords detected' },
    timeout: 0,
  }],
]);

export const SiteItem: React.FunctionComponent = () => {
  return (
    <Fragment>
      {sites.map(({ host }) => (
        <Auth.SiteTitle
          key={host}
          host={host}
          session={sessions.get(host)}
        />
      ))}
    </Fragment>
  );
};
