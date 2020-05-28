import * as React from 'react';
import { mount } from 'enzyme';
import { Banner } from './Banner';

test('<Banner />', () => {
  const wrapper = mount(<Banner />);
  expect(wrapper).toMatchSnapshot();
});
