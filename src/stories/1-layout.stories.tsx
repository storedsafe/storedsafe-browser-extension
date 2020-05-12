import React, { Fragment, useState } from 'react';
import * as UI from '../components/ui/common';

export default {
  title: 'Layout',
  decorators: [
    (storyFn: () => React.ReactNode): React.ReactNode => (
      <section className="card">
        <div style={{ padding: '1em' }}>
          {storyFn()}
        </div>
      </section>
    ),
  ]
}

export const Button: React.FunctionComponent = () => {
  const [color, setColor] = useState<'primary' | 'accent' | 'warning' | 'danger'>('primary');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Fragment>
      <UI.Button isLoading={isLoading} color={color}>
        Button
      </UI.Button>
      <br />
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

export const Banner: React.FunctionComponent = () => {
  return <UI.Banner />;
};
