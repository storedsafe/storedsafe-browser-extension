import React, { Fragment, useState } from 'react';
import * as UI from '../components/ui/common';

export default {
  title: 'Layout',
  decorators: [
    (storyFn: () => React.ReactNode): React.ReactNode => (
      <section className="card" style={{ backgroundColor: '#f9f9f9' }}>
        <div style={{ padding: '1em' }}>
          {storyFn()}
        </div>
      </section>
    ),
  ]
}

export const Banner: React.FunctionComponent = () => {
  return <UI.Banner />;
};

export const Button: React.FunctionComponent = () => {
  const [color, setColor] = useState<'primary' | 'accent' | 'warning' | 'danger'>('primary');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Fragment>
      <UI.Button isLoading={isLoading} color={color}>
        Button
      </UI.Button>
      <br />
      <p>Click buttons below to change state of above button.</p>
      <UI.Button isLoading={true} onClick={(): void => setIsLoading(!isLoading)}>
        Loading
      </UI.Button>
      <UI.Button color='primary' onClick={(): void => setColor('primary')}>
        Primary
      </UI.Button>
      <UI.Button color='accent' onClick={(): void => setColor('accent')}>
        Accent
      </UI.Button>
      <UI.Button color='warning' onClick={(): void => setColor('warning')}>
        Warning
      </UI.Button>
      <UI.Button color='danger' onClick={(): void => setColor('danger')}>
        Danger
      </UI.Button>
    </Fragment>
  );
};

export const Checkbox: React.FunctionComponent = () => (
  <Fragment>
    <label htmlFor="checked" className="label-checkbox">
      <span>Checkbox 1</span>
      <UI.Checkbox id="checked" defaultChecked={true} />
    </label>
    <label htmlFor="unchecked" className="label-checkbox">
      <span>Checkbox 2</span>
      <UI.Checkbox id="unchecked" defaultChecked={false} />
    </label>
  </Fragment>
);

export const Select: React.FunctionComponent = () => (
  <Fragment>
    <label htmlFor="select">
      <span>Select</span>
      <UI.Select id="select" defaultValue="1">
        <option value="1">Value 1</option>
        <option value="2">Value 2</option>
        <option value="3">Value 3</option>
      </UI.Select>
    </label>
  </Fragment>
);

export const Message: React.FunctionComponent = () => (
  <Fragment>
    <UI.Message type="info">Info</UI.Message>
    <UI.Message type="warning">Warning</UI.Message>
    <UI.Message type="error">Error</UI.Message>
  </Fragment>
);

export const OnlineIndicator: React.FunctionComponent = () => {
  const [online, setOnline] = useState<boolean>(true);
  return (
    <Fragment>
      <UI.OnlineIndicator online={online} />
      <UI.OnlineIndicator online={!online} />
      <UI.Button onClick={(): void => setOnline(!online)}>Toggle</UI.Button>
    </Fragment>
  );
}

export const LoadingComponent: React.FunctionComponent = () => (
  <div style={{ height: '200px', width: '100%' }}>
    <UI.LoadingComponent />
  </div>
);
