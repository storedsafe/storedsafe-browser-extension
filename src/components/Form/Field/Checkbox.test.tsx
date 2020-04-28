import * as React from 'react';
import { Checkbox } from './Checkbox';
import { shallow, mount } from 'enzyme';

const onChange = jest.fn();
const onBlur = jest.fn();

beforeEach(() => {
  onChange.mockClear();
  onBlur.mockClear();
});

test('<Checkbox />', () => {
  const wrapper = shallow(<Checkbox name="test" label="Test" value={true} />);
  const checkbox = wrapper.find('input#test');
  expect(checkbox.props().type).toBe('checkbox');
  expect(checkbox.props().checked).toBe(true);
  expect(wrapper.find('.custom-checkbox').length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});

test('<Checkbox labelDir=left/>', () => {
  const wrapper = shallow(<Checkbox name="test" label="Test" value={true} labelDir="left" />);
  const checkbox = wrapper.find('input#test');
  expect(checkbox.props().type).toBe('checkbox');
  expect(checkbox.props().checked).toBe(true);
  expect(wrapper.find('.custom-checkbox').length).toBe(1);
  expect(wrapper).toMatchSnapshot();
});

test('<Checkbox />, change', () => {
  const wrapper = mount(<Checkbox name="test" label="Test" value={false} onChange={onChange} />);
  wrapper.find('input#test').simulate(
    'change',
    { target: { name: 'test', checked: true } }
  );
  expect(onChange).toHaveBeenCalledWith(true, 'test');
});

test('<Checkbox />, blur', () => {
  const wrapper = mount(<Checkbox name="test" label="Test" value={false} onBlur={onBlur} />);
  wrapper.find('input#test').simulate(
    'blur',
    { target: { name: 'test', checked: true } }
  );
  expect(onBlur).toHaveBeenCalledWith(true, 'test');
});
