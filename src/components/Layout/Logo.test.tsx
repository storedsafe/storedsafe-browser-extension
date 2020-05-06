import React from 'react';
import { shallow } from 'enzyme';
import { Logo } from './Logo';

test('<Logo />', () => {
  const wrapper = shallow(<Logo />);
  expect(wrapper).toMatchSnapshot();
});
