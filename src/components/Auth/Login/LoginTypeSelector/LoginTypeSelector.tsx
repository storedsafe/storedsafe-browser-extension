import * as React from 'react';
import { Field } from '../../../Form';
import { LoginType } from '../Login';

export type LoginTypes = {
  title: string;
  value: LoginType;
}[];

export interface LoginTypeSelectorProps {
  loginTypes: LoginTypes;
  value?: string;
  onChange?: (selected: LoginType) => void;
}

export const LoginTypeSelector: React.SFC<LoginTypeSelectorProps> = ({
  loginTypes,
  value,
  onChange,
}: LoginTypeSelectorProps) => (
  <Field
    type="select"
    name="loginType"
    label="Login Type"
    value={value}
    onChange={onChange}
    options={loginTypes} />
);
