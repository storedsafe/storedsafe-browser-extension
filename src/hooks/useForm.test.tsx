import React from 'react';
import { mount } from 'enzyme';
import { useForm } from './useForm';

interface Values {
  text: string;
  count: number;
  range: number;
  longText: string;
  select: 'foo' | 'bar';
  selectMultiple: ('foo' | 'bar')[];
  checked: boolean;
}

const defaultValues: Values = {
  text: '',
  count: 0,
  range: 0,
  longText: '',
  select: 'foo',
  selectMultiple: ['foo'],
  checked: false,
};

const callbacks = {
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
};

const Form: React.FunctionComponent = () => {
  const [values, events] = useForm<Values>(defaultValues, callbacks);

  return (
    <form>
      <input type="text" name="text" value={values.text} {...events} />
      <input type="number" name="count" value={values.count} {...events} />
      <input type="range" name="range" value={values.range} {...events} />
      <input type="checkbox" name="checked" checked={values.checked} {...events} />
      <textarea name="longText" value={values.longText} {...events} />
      <select name="select" value={values.select} {...events}>
        <option value="foo">Foo</option>
        <option value="bar">Bar</option>
      </select>
      <select name="selectMultiple" multiple value={values.selectMultiple} {...events}>
        <option value="foo">Foo</option>
        <option value="bar">Bar</option>
      </select>
    </form>
  );
};

beforeEach(() => {
  callbacks.onChange.mockClear();
  callbacks.onBlur.mockClear();
  callbacks.onFocus.mockClear();
});

test('input type=text', () => {
  const value = 'foo';
  const wrapper = mount(<Form />);
  const input = wrapper.find('input[name="text"]');
  input.getDOMNode<HTMLInputElement>().value = value;
  input.simulate('change');
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'text');
});

test('input type=number', () => {
  const value = 83;
  const wrapper = mount(<Form />);
  const input = wrapper.find('input[name="count"]');
  input.getDOMNode<HTMLInputElement>().valueAsNumber = value;
  input.simulate('change');
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'count');
});

test('input type=number, empty', () => {
  const value = '';
  const wrapper = mount(<Form />);
  const input = wrapper.find('input[name="count"]');
  input.getDOMNode<HTMLInputElement>().value = value;
  input.simulate('change');
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'count');
});

test('input type=range', () => {
  const value = 42;
  const wrapper = mount(<Form />);
  const input = wrapper.find('input[name="range"]');
  input.getDOMNode<HTMLInputElement>().valueAsNumber = value;
  input.simulate('change');
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'range');
});

test('input type=checkbox', () => {
  const value = true;
  const wrapper = mount(<Form />);
  const input = wrapper.find('input[name="checked"]');
  input.getDOMNode<HTMLInputElement>().checked = value;
  input.simulate('change');
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'checked');
});

test('textarea', () => {
  const value = 'Long Text';
  const wrapper = mount(<Form />);
  const textArea = wrapper.find('textarea[name="longText"]');
  textArea.getDOMNode<HTMLTextAreaElement>().value = value;
  textArea.simulate('change');
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'longText');
});

test('select', () => {
  const value = 'bar';
  const wrapper = mount(<Form />);
  const select = wrapper.find('select[name="select"]');
  select.getDOMNode<HTMLTextAreaElement>().value = value;
  select.simulate('change');
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'select');
});

test('select multiple', () => {
  const value = ['foo', 'bar'];
  const wrapper = mount(<Form />);
  const select = wrapper.find('select[name="selectMultiple"]');
  const option = select.find('option[value="bar"]');
  option.getDOMNode<HTMLOptionElement>().selected = true;
  select.simulate('change');
  expect(callbacks.onChange).toHaveBeenCalledWith(value, 'selectMultiple');
});
