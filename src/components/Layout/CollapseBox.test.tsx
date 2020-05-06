import * as React from 'react';
import { shallow } from 'enzyme';
import { CollapseBox } from './CollapseBox';

test('<CollapseBox />', () => {
  const wrapper = shallow(<CollapseBox title="Title">Children</CollapseBox>);
  expect(wrapper).toMatchSnapshot();
});

test('<CollapseBox collapsed=true />', () => {
  const wrapper = shallow(<CollapseBox
    startCollapsed={true}
    title="Title">
    Children
  </CollapseBox>);
  expect(wrapper).toMatchSnapshot();
});

test('<CollapseBox collapsed=false />', () => {
  const wrapper = shallow(<CollapseBox
    startCollapsed={false}
    title="Title">
    Children
  </CollapseBox>);
  expect(wrapper).toMatchSnapshot();
});

test('<CollapseBox padded=false />', () => {
  const wrapper = shallow(<CollapseBox
    padded={false}
    title="Title">
    Children
  </CollapseBox>);
  expect(wrapper).toMatchSnapshot();
});

test('<CollapseBox padded=true />', () => {
  const wrapper = shallow(<CollapseBox
    padded={true}
    title="Title">
    Children
  </CollapseBox>);
  expect(wrapper).toMatchSnapshot();
});
