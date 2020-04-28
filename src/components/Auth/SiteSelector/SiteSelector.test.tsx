import * as React from 'react';
import { shallow } from 'enzyme';
import { Site } from '../../../model/Sites';
import { Sessions } from '../../../model/Sessions';
import { SiteSelector } from './SiteSelector';

const sites: Site[] = [
  { url: 'mock1.example.com', apikey: 'mockApikey' },
  { url: 'mock2.example.com', apikey: 'mockApikey' },
];
const sessions: Sessions = {
  [sites[0].url]: {
    apikey: sites[0].apikey,
    token: 'mockToken',
    createdAt: 0,
    lastActive: 0,
  },
};

test('<SiteSelector />', () => { const wrapper = shallow(<SiteSelector />);
  expect(wrapper).toMatchSnapshot();
});
