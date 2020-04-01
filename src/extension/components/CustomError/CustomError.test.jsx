import React from 'react';
import { shallow } from 'enzyme';
import CustomError from '.';

test('<CustomError />', () => {
  const message = 'my error';
  const wrapper = shallow(<CustomError message={message} />);
  expect(wrapper.props().children).toContain(message);
  expect(wrapper).toMatchSnapshot();
});
