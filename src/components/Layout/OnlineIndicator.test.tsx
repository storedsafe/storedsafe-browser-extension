import * as React from 'react';
import { shallow } from 'enzyme';
import { OnlineIndicator } from './OnlineIndicator';

test('<OnlineIndicator online />', () => {
  const wrapper = shallow(<OnlineIndicator online={true} />);
  expect(wrapper).toMatchSnapshot();
});

test('<OnlineIndicator offline />', () => {
  const wrapper = shallow(<OnlineIndicator online={false} />);
  expect(wrapper).toMatchSnapshot();
});
