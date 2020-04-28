import * as React from 'react';
import { Field, Option } from './Field';
import { mount } from 'enzyme';

const options: Option[] = [
  { title: 'Foo', value: 'foo' },
  { title: 'Bar', value: 'bar' },
];

test('<Input />', () => {
  const wrapper = mount(<Field name="test" label="Text" />);
  const input = wrapper.find('input#test');
  expect(input.length).toBe(1);
  expect(input.props().type).toEqual('text');
  expect(wrapper).toMatchSnapshot();
});

test('<Input type=password />', () => {
  const wrapper = mount(<Field name="test" label="Text" type="password" />);
  const input = wrapper.find('input#test');
  expect(input.length).toBe(1);
  expect(input.props().type).toEqual('password');
  expect(wrapper).toMatchSnapshot();
});

test('<Checkbox />', () => {
  const wrapper = mount(<Field name="test" label="Text" type="checkbox" />);
  const input = wrapper.find('input#test');
  expect(input.length).toBe(1);
  expect(input.props().type).toEqual('checkbox');
  expect(wrapper).toMatchSnapshot();
});

test('<Radio />', () => {
  const wrapper = mount(<Field name="test" label="Text" type="radio" options={options} />);
  const input = wrapper.find('input[type="radio"]');
  expect(input.length).toBe(2);
  expect(input.length).toBe(2);
  expect(input.at(0).props().value).toEqual(options[0].value);
  expect(input.at(1).props().value).toEqual(options[1].value);
  expect(wrapper).toMatchSnapshot();
});

test('<TextArea />', () => {
  const wrapper = mount(<Field name="test" label="Text" type="textarea" />);
  const textarea = wrapper.find('textarea#test');
  expect(textarea.length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});

test('<Select />', () => {
  const wrapper = mount(<Field name="test" label="Text" type="select" options={options} />);
  const select = wrapper.find('select#test');
  expect(select.length).toBe(1);
  const option = select.find('option');
  expect(option.length).toBe(2);
  expect(option.at(0).props().value).toEqual(options[0].value);
  expect(option.at(1).props().value).toEqual(options[1].value);
  expect(wrapper).toMatchSnapshot();
});

test('<Button />', () => {
  const wrapper = mount(<Field name="test" label="Text" type="button" />);
  const button = wrapper.find('button#test');
  expect(button.length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});
