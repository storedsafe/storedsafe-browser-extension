import * as React from 'react';
import { shallow } from 'enzyme';
import { Card } from './Card';

test('<Card />', () => {
  const wrapper = shallow(<Card />);
  expect(wrapper).toMatchSnapshot();
});
test('<Card children />', () => {
  const wrapper = shallow(<Card>Hello</Card>);
  expect(wrapper).toMatchSnapshot();
});
