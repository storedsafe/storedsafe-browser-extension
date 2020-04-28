import * as React from 'react';
import { TextArea } from './TextArea';
import { shallow, mount } from 'enzyme';

const onChange = jest.fn();
const onBlur = jest.fn();

beforeEach(() => {
  onChange.mockClear();
  onBlur.mockClear();
});

test('<TextArea />', () => {
  const wrapper = shallow(<TextArea name="test" label="test" />);
  expect(wrapper.find('textarea#test').length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});

test('<TextArea />, change', () => {
  const value = 'This is a textarea';
  const wrapper = mount(<TextArea name="test" label="test" value={value} onChange={onChange} />);
  wrapper.find('textarea#test').simulate('change', { target: { name: 'test', value: 'mockChange' } });
  expect(onChange).toHaveBeenCalledWith('mockChange', 'test');
});

test('<TextArea />, blur', () => {
  const value = 'This is a textarea';
  const wrapper = mount(<TextArea name="test" label="test" value={value} onBlur={onBlur} />);
  wrapper.find('textarea#test').simulate('blur', { target: { name: 'test', value: 'mockBlur' } });
  expect(onBlur).toHaveBeenCalledWith('mockBlur', 'test');
});
