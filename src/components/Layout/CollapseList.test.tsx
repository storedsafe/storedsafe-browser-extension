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

test('<CollapseList collapsed=false />', () => {
  const items = [
  <p key={0}>Foo</p>,
  <p key={1}>Bar</p>,
  <p key={2}>Zot</p>
  ];
  const wrapper = shallow(<CollapseList
    items={items}
    title="Title"
    startCollapsed={false}
  />);
  expect(wrapper).toMatchSnapshot();
});

test('<CollapseList collapsed=true />', () => {
  const items = [
  <p key={0}>Foo</p>,
  <p key={1}>Bar</p>,
  <p key={2}>Zot</p>
  ];
  const wrapper = shallow(<CollapseList
    items={items}
    title="Title"
    startCollapsed={true}
  />);
  expect(wrapper).toMatchSnapshot();
});

test('<CollapseList padded=false />', () => {
  const items = [
  <p key={0}>Foo</p>,
  <p key={1}>Bar</p>,
  <p key={2}>Zot</p>
  ];
  const wrapper = shallow(<CollapseList
    items={items}
    title="Title"
    padded={false}
  />);
  expect(wrapper).toMatchSnapshot();
});

test('<CollapseList padded=true />', () => {
  const items = [
  <p key={0}>Foo</p>,
  <p key={1}>Bar</p>,
  <p key={2}>Zot</p>
  ];
  const wrapper = shallow(<CollapseList
    items={items}
    title="Title"
    padded={true}
  />);
  expect(wrapper).toMatchSnapshot();
});
