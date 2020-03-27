import React from 'react';
import { shallow } from 'enzyme';
import Popup from './Popup';

test('<Popup />', () => {
  const wrapper = shallow(<Popup />);
  expect(wrapper.find('Header').length).toBe(1);
  expect(wrapper.find('Auth').length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});
