import React from 'react';
import { shallow, mount } from 'enzyme';
import LogoutForm from './LogoutForm';

const onLogout = jest.fn();

describe('rendering', () => {
  test('<LogoutForm />', () => {
    const wrapper = shallow(<LogoutForm onLogout={onLogout} />);
    expect(wrapper.find('Input[type="submit"]').length).toBe(1);
    expect(wrapper).toMatchSnapshot();
  });
});

describe('interaction', () => {
  test('<LogoutForm />', () => {
    const wrapper = mount(<LogoutForm onLogout={onLogout} />);
    wrapper.simulate('submit');
    expect(onLogout).toHaveBeenCalled();
  });
});
