import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { Form } from './Form';

const onChange = jest.fn();
const onSubmit = jest.fn();
const onReset = jest.fn();

beforeEach(() => {
  onChange.mockClear();
  onSubmit.mockClear();
  onReset.mockClear();
});

test('<Form />', () => {
  const wrapper = shallow(<Form />);
  expect(wrapper).toMatchSnapshot();
});

test('<Form />, change', () => {
  const wrapper = mount(
    <Form onChange={onChange} render={(values: { foo: string }, events): React.ReactNode => (
      <input name="foo" id="foo" value={values.foo} {...events} />
    )} />
  );
  wrapper.find('input#foo').simulate('change', { target: { name: 'foo', value: 'bar' } });
  expect(onChange).toHaveBeenCalledWith('bar', 'foo');
});

test('<Form />, submit', () => {
  const wrapper = mount(
    <Form onSubmit={onSubmit} />
  );
  wrapper.find('form').simulate('submit');
  expect(onSubmit).toHaveBeenCalledWith({});
});

test('<Form />, reset', () => {
  const initialValues = { foo: 'foo' };
  const wrapper = mount(
    <Form
      initialValues={initialValues}
      onReset={onReset}
      render={(values: { foo: string }, events): React.ReactNode => (
      <input id="foo" name="foo" value={values.foo} {...events} />
    )} />
  );
  wrapper.find('form').simulate('reset');
  expect(onReset).toHaveBeenCalledWith(initialValues, initialValues);
});
