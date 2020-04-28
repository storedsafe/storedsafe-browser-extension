import * as React from 'react';
import { shallow } from 'enzyme';
import { CollapseBox } from './CollapseBox';

test('<CollapseBox />', () => {
  const wrapper = shallow(<CollapseBox title="Title">Children</CollapseBox>);
  expect(wrapper).toMatchSnapshot();
});

test('<CollapseBox collapsed=false />', () => {
  const wrapper = shallow(<CollapseBox startCollapsed={false} title="Title">Children</CollapseBox>);
  expect(wrapper).toMatchSnapshot();
});
