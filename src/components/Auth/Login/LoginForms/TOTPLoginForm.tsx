import * as React from 'react';
import * as Form from '../../../Form';

export interface TOTPFields extends Form.FormValues {
  username: string;
  passphrase: string;
  otp: string;
  remember: boolean;
}

export interface TOTPLoginFormProps {
  onSubmit: (values: TOTPFields) => void;
  username?: string;
}

export const TOTPLoginForm: React.FC<TOTPLoginFormProps> = ({
  onSubmit,
  username,
}: TOTPLoginFormProps) => {
  const initialValues: TOTPFields = {
    username,
    passphrase: '',
    otp: '',
    remember: username !== '',
  };

  return (
    <Form.Form
      initialValues={initialValues}
      handleSubmit={onSubmit}
      render={(values: TOTPFields, onChange): React.ReactNode => (
        <React.Fragment>
          <Form.Field
            type="text"
            label="Username"
            name="username"
            value={values.username}
            onChange={onChange}
            required
          />
          <Form.Field
            type="password"
            label="Passphrase"
            name="passphrase"
            value={values.passphrase}
            onChange={onChange}
            required
          />
          <Form.Field
            type="password"
            label="OTP"
            name="otp"
            value={values.otp}
            onChange={onChange}
            required
          />
          <Form.Field
            type="checkbox"
            label="Remember Username"
            name="remember"
            value={values.remember}
            onChange={onChange}
          />
          <Form.Field
            type="submit"
            label="Login"
            name="login"
          />
        </React.Fragment>
      )} />
  );
};

TOTPLoginForm.defaultProps = {
  username: '',
};

