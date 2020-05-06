import React, { Fragment, useState } from 'react';
import * as Layout from '../components/Layout';

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
      <Layout.Button isLoading={isLoading} color={color}>
        Button
      </Layout.Button>
      <br />
      <Layout.Button isLoading={true} onClick={(): void => setIsLoading(!isLoading)}>
        Loading
      </Layout.Button>
      <Layout.Button color='primary' onClick={(): void => setColor('primary')}>
        Primary
      </Layout.Button>
      <Layout.Button color='accent' onClick={(): void => setColor('accent')}>
        Accent
      </Layout.Button>
      <Layout.Button color='warning' onClick={(): void => setColor('warning')}>
        Warning
      </Layout.Button>
      <Layout.Button color='danger' onClick={(): void => setColor('danger')}>
        Danger
      </Layout.Button>
    </Fragment>
  );
};

export const CollapsibleVertical: React.FunctionComponent = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <Fragment>
      <Layout.Button onClick={(): void => setCollapsed(!collapsed)}>
        Collapse
      </Layout.Button>
      <Layout.Collapsible collapsed={collapsed}>
        <div style={{ backgroundColor: '#f00', padding: '5em' }}>
          Vertical, unbounded
        </div>
      </Layout.Collapsible>
    </Fragment>
  );
};

export const CollapsibleHorizontal: React.FunctionComponent = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <Fragment>
      <Layout.Button onClick={(): void => setCollapsed(!collapsed)}>
        Collapse
      </Layout.Button>
      <Layout.Collapsible collapsed={collapsed} horizontal={true}>
        <div style={{ backgroundColor: '#ff0', padding: '5em' }}>
          Horiztonal, unbounded
        </div>
      </Layout.Collapsible>
    </Fragment>
  );
};

export const CollapsibleVertical100: React.FunctionComponent = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <Fragment>
      <Layout.Button onClick={(): void => setCollapsed(!collapsed)}>
        Collapse
      </Layout.Button>
      <Layout.Collapsible collapsed={collapsed} maxSize="100px">
        <div style={{ backgroundColor: '#f0f', padding: '5em' }}>
          Vertical, 100px
        </div>
      </Layout.Collapsible>
    </Fragment>
  );
};

export const CollapsibleHorizontal100: React.FunctionComponent = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <Fragment>
      <Layout.Button onClick={(): void => setCollapsed(!collapsed)}>
        Collapse
      </Layout.Button>
      <Layout.Collapsible collapsed={collapsed} horizontal={true} maxSize="100px">
        <div style={{ backgroundColor: '#0ff', padding: '5em' }}>
          Horiztonal, 100px
        </div>
      </Layout.Collapsible>
    </Fragment>
  );
};
