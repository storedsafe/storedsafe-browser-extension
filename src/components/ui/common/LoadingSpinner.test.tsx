import * as React from 'react';
import { shallow } from 'enzyme';
import { LoadingSpinner } from './LoadingSpinner';

test('<LoadingSpinner />', () => {
  const wrapper = shallow(<LoadingSpinner />);
  expect(wrapper).toMatchSnapshot();
});

test('<LoadingSpinner loading />', () => {
  const wrapper = shallow(<LoadingSpinner status="loading" />);
  expect(wrapper).toMatchSnapshot();
});

test('<LoadingSpinner success />', () => {
  const wrapper = shallow(<LoadingSpinner status="success" />);
  expect(wrapper).toMatchSnapshot();
});

test('<LoadingSpinner warning />', () => {
  const wrapper = shallow(<LoadingSpinner status="warning" />);
  expect(wrapper).toMatchSnapshot();
});

test('<LoadingSpinner error />', () => {
  const wrapper = shallow(<LoadingSpinner status="error" />);
  expect(wrapper).toMatchSnapshot();
});
