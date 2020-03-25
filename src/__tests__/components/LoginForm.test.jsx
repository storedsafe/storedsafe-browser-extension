import React from 'react';
import { shallow } from 'enzyme';

import LoginForm from '../../extension/components/Auth/LoginForm';
import YubiKeyFields from '../../extension/components/Auth/YubiKeyFields';
import TOTPFields from '../../extension/components/Auth/TOTPFields';

test('Renders common fields and YubiKey fields by default', () => {
  const wrapper = shallow(<LoginForm />);
});
