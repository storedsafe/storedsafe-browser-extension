import * as React from 'react';
import { shallow } from 'enzyme';
import { Message } from './Message';

test('<Message />', () => {
  const wrapper = shallow(<Message />);
  expect(wrapper).toMatchSnapshot();
});

test('<Message type=info />', () => {
  const wrapper = shallow(<Message type="info" />);
  expect(wrapper).toMatchSnapshot();
});

test('<Message type=warning />', () => {
  const wrapper = shallow(<Message type="warning" />);
  expect(wrapper).toMatchSnapshot();
});

test('<Message type=error />', () => {
  const wrapper = shallow(<Message type="error" />);
  expect(wrapper).toMatchSnapshot();
});

test('<Message />, with children', () => {
  const wrapper = shallow(<Message>children</Message>);
  expect(wrapper.text()).toBe('children');
  expect(wrapper).toMatchSnapshot();
});

