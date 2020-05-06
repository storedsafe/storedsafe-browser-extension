import * as React from 'react';
import { Select } from './Select';
import { shallow } from 'enzyme';

test('<Select />', () => {
  const wrapper = shallow(
    <Select name="test-name" id="test-id">
      <option value="foo">Foo</option>
      <option value="bar">Bar</option>
    </Select>
    );
  const select = wrapper.find('select#test-id');
  expect(select.find('option').length).toBe(2);
  expect(wrapper.find('div.custom-select').length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});
