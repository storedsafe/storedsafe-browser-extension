import * as React from 'react';
import { Radio } from './Radio';
import { shallow, mount } from 'enzyme';

const onChange = jest.fn();
const onBlur = jest.fn();

beforeEach(() => {
  onChange.mockClear();
  onBlur.mockClear();
});

const options = [
  { title: 'Foo', value: 'foo' },
  { title: 'Bar', value: 'bar' },
];

test('<Radio />', () => {
  const wrapper = shallow(<Radio name="test" label="Test" />);
  expect(wrapper.find('input#test').length).toBe(0);
  expect(wrapper).toMatchSnapshot();
});

test('<Radio options=...x2 />', () => {
  const wrapper = shallow(<Radio name="test" label="Test" options={options} />);
  const label = wrapper.find('label');
  expect(label.length).toBe(2);
  expect(label.at(0).text()).toBe(options[0].title)
  expect(label.at(1).text()).toBe(options[1].title)
  const input = wrapper.find('input[type="radio"]');
  expect(input.length).toBe(2);
  expect(input.at(0).props().value).toBe('foo')
  expect(input.at(1).props().value).toBe('bar')
  expect(wrapper).toMatchSnapshot();
});

test('<Radio options=...x2 labelDir=left />', () => {
  const wrapper = shallow(<Radio name="test" label="Test" options={options} labelDir="left" />);
  const label = wrapper.find('label');
  expect(label.length).toBe(2);
  expect(label.at(0).text()).toBe(options[0].title)
  expect(label.at(1).text()).toBe(options[1].title)
  const input = wrapper.find('input[type="radio"]');
  expect(input.length).toBe(2);
  expect(input.at(0).props().value).toBe('foo')
  expect(input.at(1).props().value).toBe('bar')
  expect(wrapper).toMatchSnapshot();
});


test('<Radio />, change', () => {
  const wrapper = mount(<Radio name="test" label="Test" options={options} value="foo" onChange={onChange} />);
  wrapper.find('input#test-bar').simulate('change', { target: { name: 'test', value: 'bar' } });
  expect(onChange).toHaveBeenCalledWith('bar', 'test');
});

test('<Radio />, blur', () => {
  const wrapper = mount(<Radio name="test" label="Test" options={options} value="foo" onBlur={onBlur} />);
  wrapper.find('input#test-bar').simulate('blur', { target: { name: 'test', value: 'bar' } });
  expect(onBlur).toHaveBeenCalledWith('bar', 'test');
});
