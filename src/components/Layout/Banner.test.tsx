import * as React from 'react';
import { shallow } from 'enzyme';
import { Banner } from './Banner';

test('<Card />', () => {
  const wrapper = shallow(<Banner />);
  expect(wrapper).toMatchSnapshot();
});
