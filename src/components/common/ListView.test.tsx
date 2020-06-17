import * as React from 'react';
import { shallow } from 'enzyme';
import { ListView } from './ListView';

test('<Button />', () => {
  const wrapper = shallow(<ListView items={[]} />);
  expect(wrapper).toMatchSnapshot();
});

