import * as React from 'react';
import { Radio } from './Radio';
import { shallow } from 'enzyme';

test('<Radio />', () => {
  const wrapper = shallow(<Radio name="test-name" id="test-id" />);
  expect(wrapper.find('input[type="radio"]#test-id').length).toBe(1);
  expect(wrapper.find('span.custom-radio').length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});
