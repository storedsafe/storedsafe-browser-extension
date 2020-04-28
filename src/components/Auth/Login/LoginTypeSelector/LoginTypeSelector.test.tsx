import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { LoginTypeSelector, LoginTypes } from './LoginTypeSelector';

const loginTypes: LoginTypes = [
  { title: 'YubiKey', value: 'yubikey' },
  { title: 'TOTP', value: 'totp' },
];

test('<LoginTypeSelector />', () => {
  const wrapper = shallow(<LoginTypeSelector loginTypes={loginTypes} />);
  expect(wrapper).toMatchSnapshot();
});

test('<LoginTypeSelector value=totp />', () => {
  const wrapper = shallow(<LoginTypeSelector loginTypes={loginTypes} value={'totp'} />);
  expect(wrapper).toMatchSnapshot();
});

test('<LoginTypeSelector />, integration', () => {
  const onChange = jest.fn();
  const wrapper = mount(<LoginTypeSelector
    loginTypes={loginTypes}
    value={'yubikey'}
    onChange={onChange} />
  );
  const select = wrapper.find('select');
  select.simulate('change', { target: { value: 'yubikey', name: 'loginType' } });
  expect(onChange).toHaveBeenCalledWith('yubikey', 'loginType');
});
