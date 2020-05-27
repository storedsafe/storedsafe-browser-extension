import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { MenuButton } from './MenuButton';

const onClick = jest.fn();

test('<MenuButton />', () => {
  const wrapper = shallow(
    <MenuButton
      title="Button"
      icon={<svg />}
      onClick={onClick}
    />
  );
  expect(wrapper).toMatchSnapshot();
});

test('<MenuButton selected=true />', () => {
  const wrapper = shallow(
    <MenuButton
      title="Button"
      icon={<svg />}
      onClick={onClick}
      selected={true}
    />
  );
  expect(wrapper).toMatchSnapshot();
});

test('<MenuButton selected=false />', () => {
  const wrapper = shallow(
    <MenuButton
      title="Button"
      icon={<svg />}
      onClick={onClick}
      selected={false}
    />
  );
  expect(wrapper).toMatchSnapshot();
});

test('<MenuButton click />', () => {
  const wrapper = mount(
    <MenuButton
      title="Button"
      icon={<svg />}
      onClick={onClick}
    />
  );
  wrapper.simulate('click');
  expect(onClick).toHaveBeenCalled();
});
