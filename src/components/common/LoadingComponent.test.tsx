import * as React from 'react';
import { shallow } from 'enzyme';
import { LoadingComponent } from './LoadingComponent';

test('<LoadingComponent />', () => {
  const wrapper = shallow(<LoadingComponent />);
  expect(wrapper).toMatchSnapshot();
});
