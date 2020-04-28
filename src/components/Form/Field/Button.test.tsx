import * as React from 'react';
import { Button } from './Button';
import { shallow, mount } from 'enzyme';

const onBlur = jest.fn();

beforeEach(() => {
  onBlur.mockClear();
});

test('<Button submit />', () => {
  const wrapper = shallow(<Button name="test" type="submit" label="Submit" />);
  const input = wrapper.find('button#test');
  expect(input.props().type).toBe('submit');
  expect(input.text()).toBe('Submit');
  expect(wrapper).toMatchSnapshot();
});

test('<Button button />', () => {
  const wrapper = shallow(<Button name="test" type="button" label="Button" />);
  const input = wrapper.find('button#test');
  expect(input.props().type).toBe('button');
  expect(input.text()).toBe('Button');
  expect(wrapper).toMatchSnapshot();
});

test('<Button reset />', () => {
  const wrapper = shallow(<Button name="test" type="reset" label="Reset" />);
  const input = wrapper.find('button#test');
  expect(input.props().type).toBe('reset');
  expect(input.text()).toBe('Reset');
  expect(wrapper).toMatchSnapshot();
});

test('<Button />, blur', () => {
  const wrapper = mount(<Button name="test" label="Submit" value="submit" onBlur={onBlur} />);
  wrapper.find('button#test').simulate('blur');
  expect(onBlur).toHaveBeenCalledWith('submit', 'test');
});
