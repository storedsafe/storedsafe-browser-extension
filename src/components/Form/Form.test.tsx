import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { Form } from './Form';
import { Field } from './Field';

const handleChange = jest.fn();
const handleSubmit = jest.fn();
const handleReset = jest.fn();

beforeEach(() => {
  handleChange.mockClear();
  handleSubmit.mockClear();
  handleReset.mockClear();
});

test('<Form />', () => {
  const wrapper = shallow(<Form />);
  expect(wrapper).toMatchSnapshot();
});

test('<Form />, change', () => {
  const wrapper = mount(
    <Form handleChange={handleChange} render={(values: { foo: string }, onChange): React.ReactNode => (
      <Field name="foo" label="Foo" value={values.foo} onChange={onChange} />
    )} />
  );
  wrapper.find('input#foo').simulate('change', { target: { name: 'foo', value: 'bar' } });
  expect(handleChange).toHaveBeenCalledWith('bar', 'foo');
});

test('<Form />, submit', () => {
  const wrapper = mount(
    <Form handleSubmit={handleSubmit} />
  );
  wrapper.find('form').simulate('submit');
  expect(handleSubmit).toHaveBeenCalledWith({});
});

test('<Form />, reset', () => {
  const initialValues = { foo: 'foo' };
  const wrapper = mount(
    <Form
      initialValues={initialValues}
      handleReset={handleReset}
      render={(values: { foo: string }, onChange): React.ReactNode => (
      <Field id="foo" label="Foo" value={values.foo} onChange={onChange} />
    )} />
  );
  wrapper.find('form').simulate('reset');
  expect(handleReset).toHaveBeenCalledWith(initialValues, initialValues);
});
