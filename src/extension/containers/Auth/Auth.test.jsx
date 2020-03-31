import React from 'react';
import { shallow } from 'enzyme';
import Auth from './Auth';

test('<Auth />', () => {
  const wrapper = shallow(<Auth />);
  expect(wrapper).toMatchSnapshot();
});
