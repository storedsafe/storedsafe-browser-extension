import * as React from 'react';
import { Field } from '../../Form';

export interface LogoutProps {
  onLogout: () => void;
}

export const Logout: React.SFC<LogoutProps> = ({
  onLogout
}: LogoutProps) => (
  <Field
    type="button"
    name="logout"
    label="Logout"
    onClick={onLogout}
  />
);
