import * as React from 'react';
import { shallow } from 'enzyme';
import { CollapseList } from './CollapseList';

test('<CollapseList />', () => {
  const items = [
  <p key={0}>Foo</p>,
  <p key={1}>Bar</p>,
  <p key={2}>Zot</p>
  ];
  const wrapper = shallow(<CollapseList items={items} title="Title" />);
  expect(wrapper).toMatchSnapshot();
});
