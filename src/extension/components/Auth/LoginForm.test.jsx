import React from 'react';
import { shallow, mount } from 'enzyme';
import LoginForm, { LoginType } from './LoginForm';
import Input from '../Input';

const onLogin = jest.fn();

describe('rendering', () => {
  test('<LoginForm />', () => {
    const wrapper = shallow(<LoginForm onLogin={onLogin} />);
    expect(wrapper.find('Input[name="logintype"]').length).toBe(1);
    expect(wrapper.find('Input[name="username"]').length).toBe(1);
    expect(wrapper.find('Input[name="keys"]').length).toBe(1);
    expect(wrapper.find('Input[name="remember"]').length).toBe(1);
    expect(wrapper.find('Input[type="submit"]').length).toBe(1);
    expect(wrapper.find(Input).length).toBe(5);
    expect(wrapper).toMatchSnapshot();
  });

  test('<LoginForm defaultLoginType="yubikey" />', () => {
    const wrapper = shallow((
      <LoginForm defaultLoginType={LoginType.YUBIKEY} onLogin={onLogin} />
    ));
    expect(wrapper.find('Input[name="logintype"]').length).toBe(1);
    expect(wrapper.find('Input[name="username"]').length).toBe(1);
    expect(wrapper.find('Input[name="keys"]').length).toBe(1);
    expect(wrapper.find('Input[name="remember"]').length).toBe(1);
    expect(wrapper.find('Input[type="submit"]').length).toBe(1);
    expect(wrapper.find(Input).length).toBe(5);
    expect(wrapper).toMatchSnapshot();
  });

  test('<LoginForm defaultLoginType="totp" />', () => {
    const wrapper = shallow((
      <LoginForm defaultLoginType={LoginType.TOTP} onLogin={onLogin} />
    ));
    expect(wrapper.find('Input[name="logintype"]').length).toBe(1);
    expect(wrapper.find('Input[name="username"]').length).toBe(1);
    expect(wrapper.find('Input[name="passphrase"]').length).toBe(1);
    expect(wrapper.find('Input[name="otp"]').length).toBe(1);
    expect(wrapper.find('Input[name="remember"]').length).toBe(1);
    expect(wrapper.find('Input[type="submit"]').length).toBe(1);
    expect(wrapper.find(Input).length).toBe(6);
    expect(wrapper).toMatchSnapshot();
  });
});

describe('interaction', () => {
  test('<LoginForm />, changes fields on change loginType', () => {
    const wrapper = mount((
      <LoginForm defaultLoginType={LoginType.YUBIKEY} onLogin={onLogin} />
    ));
    const select = wrapper.find('select');
    expect(wrapper.find('input[name="keys"]').length).toBe(1);
    expect(wrapper.find('input[name="passphrase"]').length).toBe(0);
    expect(wrapper.find('input[name="otp"]').length).toBe(0);
    select.simulate('change', { target: { value: LoginType.TOTP } });
    expect(wrapper.find('input[name="keys"]').length).toBe(0);
    expect(wrapper.find('input[name="passphrase"]').length).toBe(1);
    expect(wrapper.find('input[name="otp"]').length).toBe(1);
  });

  test('<LoginForm defaultLoginType="yubikey" />, submit', () => {
    const username = 'fredrik';
    const passphrase = 's3cr3t';
    const otp = 'cccccccccccccccccccccccccccccccccccccccccccc';
    const wrapper = mount((
      <LoginForm defaultLoginType={LoginType.YUBIKEY} onLogin={onLogin} />
    ));
    wrapper.find('input[name="username"]')
      .simulate('change', {
        target: { name: 'username', value: username },
      });
    wrapper.find('input[name="keys"]')
      .simulate('change', {
        target: { name: 'keys', value: passphrase + otp },
      });
    wrapper.find('input[name="remember"]')
      .simulate('change', {
        target: { type: 'checkbox', name: 'remember', checked: true },
      });
    wrapper.simulate('submit');
    expect(onLogin).toHaveBeenLastCalledWith(
      LoginType.YUBIKEY,
      true,
      { username, passphrase, otp },
    );
  });

  test('<LoginForm defaultLoginType="totp" />, submit', () => {
    const username = 'peter';
    const passphrase = 'p4ssw0rd';
    const otp = '123987';
    const wrapper = mount((
      <LoginForm defaultLoginType={LoginType.TOTP} onLogin={onLogin} />
    ));
    wrapper.find('input[name="username"]')
      .simulate('change', {
        target: { name: 'username', value: username },
      });
    wrapper.find('input[name="passphrase"]')
      .simulate('change', {
        target: { name: 'passphrase', value: passphrase },
      });
    wrapper.find('input[name="otp"]')
      .simulate('change', {
        target: { name: 'otp', value: otp },
      });
    wrapper.find('input[name="remember"]')
      .simulate('change', {
        target: { type: 'checkbox', name: 'remember', checked: false },
      });
    wrapper.simulate('submit');
    expect(onLogin).toHaveBeenLastCalledWith(
      LoginType.TOTP,
      false,
      { username, passphrase, otp },
    );
  });
});
