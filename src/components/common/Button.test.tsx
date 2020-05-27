import * as React from 'react';
import { shallow } from 'enzyme';
import { Button } from './Button';

test('<Button />', () => {
  const wrapper = shallow(<Button />);
  expect(wrapper).toMatchSnapshot();
});

test('<Button color=primary />', () => {
  const wrapper = shallow(<Button color="primary" />);
  expect(wrapper).toMatchSnapshot();
});

test('<Button color=accent />', () => {
  const wrapper = shallow(<Button color="accent" />);
  expect(wrapper).toMatchSnapshot();
});

test('<Button color=warning />', () => {
  const wrapper = shallow(<Button color="warning" />);
  expect(wrapper).toMatchSnapshot();
});

test('<Button color=danger />', () => {
  const wrapper = shallow(<Button color="danger" />);
  expect(wrapper).toMatchSnapshot();
});

test('<Button isLoading />', () => {
  const wrapper = shallow(<Button isLoading={true} />);
  expect(wrapper).toMatchSnapshot();
});

test('<Button />, with children', () => {
  const wrapper = shallow(<Button>children</Button>);
  expect(wrapper.text()).toBe('children');
  expect(wrapper).toMatchSnapshot();
});

