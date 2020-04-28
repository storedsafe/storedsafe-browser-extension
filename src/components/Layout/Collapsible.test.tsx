import * as React from 'react';
import { shallow } from 'enzyme';
import { Collapsible } from './Collapsible';

test('<Collapsible />', () => {
  const wrapper = shallow(<Collapsible>Children</Collapsible>);
  expect(wrapper).toMatchSnapshot();
});

test('<Collapsible collapsed=true />', () => {
  const wrapper = shallow(
    <Collapsible collapsed={true}>
      Children
    </Collapsible>
  );
  expect(wrapper).toMatchSnapshot();
});

test('<Collapsible collapsed=false />', () => {
  const wrapper = shallow(
    <Collapsible collapsed={false}>
      Children
    </Collapsible>
  );
  expect(wrapper).toMatchSnapshot();
});
