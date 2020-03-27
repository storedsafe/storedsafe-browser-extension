import React from 'react';
import { shallow } from 'enzyme';
import Input from '.';

describe('basic snapshot', () => {
  test('renders checkbox', () => {
    const type = 'checkbox';
    const name = 'checkboxName';
    const title = 'My Checkbox';
    const wrapper = shallow((
      <Input type={type} name={name} title={title} />
    ));
    // Label parent with for-attribute
    const label = wrapper.find('label');
    expect(label.length).toBe(1);
    expect(label.prop('htmlFor')).toBe(name);
    // Title in first span
    expect(label.find('span').first().text()).toBe(title);
    // Checkbox type input
    const input = label.find(`input[type="${type}"]`);
    expect(input.length).toBe(1);
    expect(input.prop('name')).toBe(name);
    expect(input.prop('id')).toBe(name);
    // Second span used for custom checkbox display
    expect(label.find('span.checkmark').length).toBe(1);
    expect(wrapper).toMatchSnapshot();
  });

  test('renders select', () => {
    const type = 'select';
    const name = 'selectName';
    const title = 'My Select';
    const wrapper = shallow((
      <Input type={type} name={name} title={title}>
        <option selected>One</option>
        <option>Two</option>
      </Input>
    ));
    // Label parent with for-attribute
    const label = wrapper.find('label');
    expect(label.length).toBe(1);
    expect(label.prop('htmlFor')).toBe(name);
    // Title in span
    expect(label.find('span').text()).toBe(title);
    // Div wrapping select for custom style
    const div = label.find('div');
    expect(div.length).toBe(1);
    // Select type element
    const input = div.find('select');
    expect(input.length).toBe(1);
    expect(input.prop('name')).toBe(name);
    expect(input.prop('id')).toBe(name);
    // Contains two child elements
    expect(input.find('option').length).toBe(2);
    expect(wrapper).toMatchSnapshot();
  });

  test('renders textarea', () => {
    const type = 'textarea';
    const name = 'textareaName';
    const title = 'My Textarea';
    const wrapper = shallow((
      <Input type={type} name={name} title={title} />
    ));
    // Label parent with for-attribute
    const label = wrapper.find('label');
    expect(label.length).toBe(1);
    expect(label.prop('htmlFor')).toBe(name);
    // Title in span
    expect(label.find('span').text()).toBe(title);
    // Textarea element
    const input = label.find('textarea');
    expect(input.length).toBe(1);
    expect(input.prop('name')).toBe(name);
    expect(input.prop('id')).toBe(name);
    expect(wrapper).toMatchSnapshot();
  });

  test('renders button', () => {
    const type = 'button';
    const name = 'buttonName';
    const title = 'My Button';
    const wrapper = shallow((
      <Input type={type} name={name} title={title} />
    ));
    // Button type input
    const input = wrapper.find(`input[type="${type}"]`);
    expect(input.length).toBe(1);
    expect(input.prop('name')).toBe(name);
    expect(input.prop('id')).toBe(name);
    // Title in value for buttons
    expect(input.prop('value')).toBe(title);
    expect(wrapper).toMatchSnapshot();
  });

  test('renders submit', () => {
    const type = 'submit';
    const name = 'submitName';
    const title = 'My Submit';
    const wrapper = shallow((
      <Input type={type} name={name} title={title} />
    ));
    // Submit type input
    const input = wrapper.find(`input[type="${type}"]`);
    expect(input.length).toBe(1);
    expect(input.prop('name')).toBe(name);
    expect(input.prop('id')).toBe(name);
    // Title in value for buttons
    expect(input.prop('value')).toBe(title);
    expect(wrapper).toMatchSnapshot();
  });

  test('renders arbitrary input', () => {
    const type = 'inputType';
    const name = 'inputName';
    const title = 'My Input';
    const wrapper = shallow((
      <Input type={type} name={name} title={title} />
    ));
    const label = wrapper.find('label');
    expect(label.length).toBe(1);
    expect(label.prop('htmlFor')).toBe(name);
    expect(label.find('span').text()).toBe(title);
    // inputType type input
    const input = label.find(`input[type="${type}"]`);
    expect(input.length).toBe(1);
    expect(input.prop('name')).toBe(name);
    expect(input.prop('id')).toBe(name);
    expect(wrapper).toMatchSnapshot();
  });
});

describe('with arbitrary props', () => {
  test('renders checkbox with myCheckboxProp', () => {
    const type = 'checkbox';
    const name = 'checkboxName';
    const title = 'My Checkbox';
    const myProp = 'myCheckboxProp';
    const myValue = 'myCheckboxValue';
    const wrapper = shallow((
      <Input type={type} name={name} title={title} myCheckboxProp={myValue} />
    ));
    expect(wrapper.find('input').prop(myProp)).toBe(myValue);
  });

  test('renders select with mySelectProp', () => {
    const type = 'select';
    const name = 'selectName';
    const title = 'My Select';
    const myProp = 'mySelectProp';
    const myValue = 'mySelectValue';
    const wrapper = shallow((
      <Input type={type} name={name} title={title} mySelectProp={myValue}>
        <option selected>One</option>
        <option>Two</option>
      </Input>
    ));
    expect(wrapper.find('select').prop(myProp)).toBe(myValue);
  });

  test('renders textarea', () => {
    const type = 'textarea';
    const name = 'textareaName';
    const title = 'My Textarea';
    const myProp = 'myTextareaProp';
    const myValue = 'myTextareaValue';
    const wrapper = shallow((
      <Input type={type} name={name} title={title} myTextareaProp={myValue} />
    ));
    expect(wrapper.find('textarea').prop(myProp)).toBe(myValue);
  });

  test('renders button', () => {
    const type = 'button';
    const name = 'buttonName';
    const title = 'My Button';
    const myProp = 'myButtonProp';
    const myValue = 'myButtonValue';
    const wrapper = shallow((
      <Input type={type} name={name} title={title} myButtonProp={myValue} />
    ));
    expect(wrapper.find('input').prop(myProp)).toBe(myValue);
  });

  test('renders submit', () => {
    const type = 'submit';
    const name = 'submitName';
    const title = 'My Submit';
    const myProp = 'mySubmitProp';
    const myValue = 'mySubmitValue';
    const wrapper = shallow((
      <Input type={type} name={name} title={title} mySubmitProp={myValue} />
    ));
    expect(wrapper.find('input').prop(myProp)).toBe(myValue);
  });

  test('renders arbitrary input', () => {
    const type = 'inputType';
    const name = 'inputName';
    const title = 'My Input';
    const myProp = 'myArbitraryProp';
    const myValue = 'myArbitraryValue';
    const wrapper = shallow((
      <Input type={type} name={name} title={title} myArbitraryProp={myValue} />
    ));
    expect(wrapper.find('input').prop(myProp)).toBe(myValue);
  });
});
