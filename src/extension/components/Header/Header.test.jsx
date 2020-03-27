import React from 'react';
import { shallow } from 'enzyme';
import Header from './Header';

test('<Header />', () => {
  const wrapper = shallow(<Header />);
  expect(wrapper.find('img').length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});
