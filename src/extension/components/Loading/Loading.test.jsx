import React from 'react';
import { shallow } from 'enzyme';
import Loading from '.';

test('<Loading />', () => {
  const wrapper = shallow(<Loading />);
  expect(wrapper).toMatchSnapshot();
});
