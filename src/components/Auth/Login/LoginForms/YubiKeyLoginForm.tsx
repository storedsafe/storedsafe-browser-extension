import * as React from 'react';
import * as Form from '../../../Form';

export interface YubiKeyFields extends Form.FormValues {
  username: string;
  keys: string;
  remember: boolean;
}

export interface YubiKeyLoginFormProps {
  onSubmit: (values: YubiKeyFields) => void;
  username?: string;
}

export const YubiKeyLoginForm: React.FC<YubiKeyLoginFormProps> = ({
  onSubmit,
  username,
}: YubiKeyLoginFormProps) => {
  const initialValues: Form.FormValues = {
    username,
    remember: username !== '',
  };

  return (
    <Form.Form
      initialValues={initialValues}
      handleSubmit={onSubmit}
      render={(values: YubiKeyFields, onChange): React.ReactNode => (
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
            label="Keys"
            name="keys"
            value={values.keys}
            onChange={onChange}
            pattern=".+.{44}"
            title="Passphrase + YubiKey Press"
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

YubiKeyLoginForm.defaultProps = {
  username: '',
};
