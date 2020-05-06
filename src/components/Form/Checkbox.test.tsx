import * as React from 'react';
import { Checkbox } from './Checkbox';
import { shallow } from 'enzyme';

test('<Radio />', () => {
  const wrapper = shallow(<Checkbox name="test-name" id="test-id" />);
  expect(wrapper.find('input[type="checkbox"]#test-id').length).toBe(1);
  expect(wrapper.find('span.custom-checkbox').length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});
