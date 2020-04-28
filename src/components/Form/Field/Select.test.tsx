import * as React from 'react';
import { Select } from './Select';
import { shallow, mount } from 'enzyme';

const onChange = jest.fn();
const onBlur = jest.fn();

const options = [
  { title: 'Foo', value: 'foo' },
  { title: 'Bar', value: 'bar' },
];

beforeEach(() => {
  onChange.mockClear();
  onBlur.mockClear();
});

test('<Select />', () => {
  const wrapper = shallow(<Select name="test" label="test" />);
  const select = wrapper.find('select#test');
  expect(select.find('option').length).toBe(0);
  expect(wrapper.find('div.custom-select').length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});

test('<Select options=...x2 />', () => {
  const wrapper = shallow(<Select name="test" label="test" options={options} />);
  const select = wrapper.find('select#test');
  const option = select.find('option');
  expect(option.length).toBe(2);
  expect(option.at(0).props().value).toBe('foo')
  expect(option.at(0).text()).toBe('Foo')
  expect(option.at(1).props().value).toBe('bar')
  expect(option.at(1).text()).toBe('Bar')
  expect(wrapper).toMatchSnapshot();
});

test('<Select options=...x2 />, change', () => {
  const wrapper = mount(<Select name="test" label="test" options={options} value="foo" onChange={onChange} />);
  wrapper.find('select#test').simulate('change', { target: { name: 'test', value: 'bar' } });
  expect(onChange).toHaveBeenCalledWith('bar', 'test');
});

test('<Select options=...x2 />, blur', () => {
  const wrapper = mount(<Select name="test" label="test" options={options} value="foo" onBlur={onBlur} />);
  wrapper.find('select#test').simulate('blur', { target: { name: 'test', value: 'bar' } });
  expect(onBlur).toHaveBeenCalledWith('bar', 'test');
});
