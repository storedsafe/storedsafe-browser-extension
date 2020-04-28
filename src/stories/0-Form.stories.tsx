import * as React from 'react';
import { action } from '@storybook/addon-actions';
import * as Form from '../components/Form';

export default {
  title: 'Form',
  component: Form.Form,
};

const initialValues: Form.FormValues = {
  select: 'bar',
  textarea: 'textarea',
  text: 'text',
  password: 'password',
  number: 5,
  range: 5,
  date: '2020-04-16',
  checkbox: false,
  radio: 'bar',
};

const options: Form.Option[] = [
  { title: 'Foo', value: 'foo' },
  { title: 'Bar', value: 'bar' },
  { title: 'Zot', value: 'zot' },
];

const actions = {
  handleSubmit: action('submit'),
  handleChange: action('change'),
  handleBlur: action('blur'),
  handleReset: action('reset')
}

export const Default: React.SFC = () => (
  <Form.Form
    {...actions}
    initialValues={initialValues}
    render={(values, onChange, onBlur): React.ReactNode => (
    <React.Fragment>
      <Form.Field
        label="Select"
        name="select"
        type="select"
        options={options}
        value={values.select}
        onChange={onChange}
        onBlur={onBlur}
      />
      <Form.Field
        label="Textarea"
        name="textarea"
        type="textarea"
        value={values.textarea}
        onChange={onChange}
        onBlur={onBlur}
      />
      <Form.Field
        label="Text"
        name="text"
        type="text"
        value={values.text}
        onChange={onChange}
        onBlur={onBlur}
      />
      <Form.Field
        label="Password"
        name="password"
        type="password"
        value={values.password}
        onChange={onChange}
        onBlur={onBlur}
      />
      <Form.Field
        label="Number"
        name="number"
        type="number"
        value={values.number}
        onChange={onChange}
        onBlur={onBlur}
      />
      <Form.Field
        name="range"
        type="range"
        label="Range"
        value={values.range}
        min="0"
        max="10"
        step="0.1"
        onChange={onChange}
        onBlur={onBlur}
      />
      <Form.Field
        label="Date"
        name="date"
        type="date"
        value={values.date}
        onChange={onChange}
        onBlur={onBlur}
      />
      <Form.Field
        label="Checkbox"
        name="checkbox"
        type="checkbox"
        value={values.checkbox}
        onChange={onChange}
        onBlur={onBlur}
      />
      <Form.Field
        label="Radio"
        name="radio"
        type="radio"
        options={options}
        value={values.radio}
        onChange={onChange}
        onBlur={onBlur}
      />
      <Form.Field
        label="Submit"
        name="submit"
        type="submit"
        value="submit"
        onClick={action('click')}
        onBlur={onBlur}
      />
      <Form.Field
        label="Button"
        name="button"
        type="button"
        value="button"
        onClick={action('click')}
        onBlur={onBlur}
      />
      <Form.Field
        label="Reset"
        name="reset"
        type="reset"
        value="reset"
        onClick={action('click')}
        onBlur={onBlur}
      />
    </React.Fragment>
  )} />
);

