import React from 'react';
import { shallow } from 'enzyme';
import Extension from '.';
import Settings from '../../pages/Settings';
import Popup from '../../pages/Popup';

global.window = Object.create(window);
Object.defineProperty(window, 'location', { value: { href: null } });

const url = 'extension://abc123/index.html';

test('<Extension />, default => <Settings />', () => {
  window.location.href = url;
  const wrapper = shallow(<Extension />);
  expect(wrapper.find(Settings).length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});

test('<Extension />, #popup => <Popup />', () => {
  window.location.href = `${url}#popup`;
  const wrapper = shallow(<Extension />);
  expect(wrapper.find(Popup).length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});
