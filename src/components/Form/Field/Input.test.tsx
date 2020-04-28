import * as React from 'react';
import { Input } from './Input';
import { shallow, mount } from 'enzyme';

const onChange = jest.fn();
const onBlur = jest.fn();

beforeEach(() => {
  onChange.mockClear();
  onBlur.mockClear();
});

test('<Input />', () => {
  const wrapper = shallow(<Input name="test" label="Test" />);
  const input = wrapper.find('input#test');
  expect(input.props().type).toBe('text');
  expect(wrapper).toMatchSnapshot();
});

test('<Input password />', () => {
  const wrapper = shallow(<Input name="test" label="Test" type="password" />);
  const input = wrapper.find('input#test');
  expect(input.props().type).toBe('password');
  expect(wrapper).toMatchSnapshot();
});

test('<Input number />, NaN', () => {
  const wrapper = shallow(<Input name="test" label="Test" type="number" value={NaN} />);
  const input = wrapper.find('input#test');
  expect(input.props().value).toBe('');
  expect(wrapper).toMatchSnapshot();
});

test('<Input />, change', () => {
  const wrapper = mount(<Input name="test" label="Test" value="foo" onChange={onChange} />);
  wrapper.find('input#test').simulate('change', { target: { name: 'test', value: 'bar' } });
  expect(onChange).toHaveBeenCalledWith('bar', 'test');
});

test('<Input number />, change', () => {
  const wrapper = mount(<Input name="test" label="Test" type="number" value={1} onChange={onChange} />);
  wrapper.find('input#test').simulate('change', { target: { name: 'test', valueAsNumber: 2 } });
  expect(onChange).toHaveBeenCalledWith(2, 'test');
});

test('<Input />, blur', () => {
  const wrapper = mount(<Input name="test" label="Test" type="text" value="foo" onBlur={onBlur} />);
  wrapper.find('input#test').simulate('blur', { target: { name: 'test', value: 'bar' } });
  expect(onBlur).toHaveBeenCalledWith('bar', 'test');
});

test('<Input number />, blur', () => {
  const wrapper = mount(<Input name="test" label="Test" type="number" value={1} onBlur={onBlur} />);
  wrapper.find('input#test').simulate('blur', { target: { name: 'test', valueAsNumber: 2 } });
  expect(onBlur).toHaveBeenCalledWith(2, 'test');
});
