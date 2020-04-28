import * as React from 'react';
import { LoginType } from '../Login';
import { LoginTypeSelector, LoginTypeSelectorProps } from './LoginTypeSelector';

type OnLoginTypeChangeCallback = (loginType: LoginType) => void;

export interface LoginTypeSelectorContainerProps extends LoginTypeSelectorProps {
  onSiteChangeCallback?: OnLoginTypeChangeCallback;
  render: (
    loginType: LoginType,
  ) => React.ReactNode;
}

export const LoginTypeSelectorContainer: React.FC<LoginTypeSelectorContainerProps> = ({
  onSiteChangeCallback,
  render,
  ...props
}: LoginTypeSelectorContainerProps) => {
  const [selected, setSelected] = React.useState<LoginType>(props.loginTypes[0].value);

  const onChange = (selected: LoginType): void => {
    onSiteChangeCallback && onSiteChangeCallback(selected);
    setSelected(selected);
  };

  return (
    <React.Fragment>
      <LoginTypeSelector value={selected} onChange={onChange} {...props} />
      {render(selected)}
    </React.Fragment>
  );
};
