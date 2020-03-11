import React from 'react';
import { shallow } from 'enzyme';

import Extension from '../containers/Extension';
import Welcome from '../pages/Welcome';
import Popup from '../pages/Popup';

global.window = Object.create(window);
Object.defineProperty(window, 'location', { value: { href: null }});

const url = "extension://abc123/index.html";

test('Extension renders Welcome page when no path is given', () => {
  window.location.href=url;
  const wrapper = shallow(<Extension />);
  expect(wrapper.find(Welcome).length).toBe(1);
});

test('Extension renders Popup page when location is #popup', () => {
  window.location.href=url+'#popup';
  const wrapper = shallow(<Extension />);
  expect(wrapper.find(Popup).length).toBe(1);
});
