import * as React from 'react';
import * as Layout from '../components/Layout';

export default {
  title: 'Layout',
  component: Layout,
};

export const Message: React.SFC = () => (
  <React.Fragment>
    <Layout.Message type="info">
      Message Info
    </Layout.Message>
    <Layout.Message type="warning">
      Message Warning
    </Layout.Message>
    <Layout.Message type="error">
      Message Error
    </Layout.Message>
  </React.Fragment>
);

export const Loading: React.FC = () => {
  const [status, setStatus] = React.useState<'loading' | 'error' | 'warning' | 'success'>('loading');
  return (
    <React.Fragment>
      <Layout.LoadingSpinner status={status} />
      <button onClick={(): void => setStatus('loading')}>Loading</button>
      <button onClick={(): void => setStatus('error')}>Error</button>
      <button onClick={(): void => setStatus('warning')}>Warning</button>
      <button onClick={(): void => setStatus('success')}>Success</button>
      <Layout.LoadingSpinner status="error" />
      <Layout.LoadingSpinner status="warning" />
      <Layout.LoadingSpinner status="success" />
    </React.Fragment>
  );
};

export const OnlineIndicator: React.FC = () => {
  const [online, setOnline] = React.useState<boolean>(true);
  return (
    <React.Fragment>
      <Layout.OnlineIndicator online={online} />
      <button onClick={(): void => setOnline(true)}>Online</button>
      <button onClick={(): void => setOnline(false)}>Offline</button>
      <Layout.OnlineIndicator online={true} />
      <Layout.OnlineIndicator online={false} />
    </React.Fragment>
  );
};

export const Collapsible: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  return (
    <React.Fragment>
      <button onClick={(): void => setCollapsed(!collapsed)}>Collapse</button>
      <Layout.Collapsible collapsed={collapsed}>
        <div style={{ backgroundColor: '#f93', color: '#fff' }}>
          <p>Foo</p>
          <p>Bar</p>
          <p>Zot</p>
        </div>
      </Layout.Collapsible>
      <Layout.Collapsible collapsed={false}>
        <div style={{ backgroundColor: '#36f', color: '#fff' }}>
          <p>Foo</p>
          <p>Bar</p>
          <p>Zot</p>
          <Layout.Collapsible collapsed={collapsed}>
            <div style={{ backgroundColor: '#fff', color: '#000' }}>
              <p>Foo</p>
              <p>Bar</p>
              <p>Zot</p>
            </div>
          </Layout.Collapsible>
        </div>
      </Layout.Collapsible>
      <Layout.Collapsible collapsed={!collapsed}>
        <div style={{ backgroundColor: '#000', color: '#fff' }}>
          <p>Foo</p>
          <p>Bar</p>
          <p>Zot</p>
        </div>
      </Layout.Collapsible>
    </React.Fragment>
  );
};

export const CollapseBox: React.FC = () => (
  <React.Fragment>
    <Layout.CollapseBox startCollapsed={false} title={<strong>Title</strong>}>
      <p>Foo</p>
      <p>Bar</p>
      <p>Zot</p>
    </Layout.CollapseBox>
    <Layout.CollapseBox startCollapsed={true} title={<strong>Title</strong>}>
      <p>Foo</p>
      <p>Bar</p>
      <p>Zot</p>
    </Layout.CollapseBox>
  </React.Fragment>
);

export const CollapseList: React.FC = () => {
  const collapseListItems = [
  <p key={0}>Foo</p>,
  <p key={1}>Bar</p>,
  <p key={2}>Zot</p>
  ];
  return (
    <React.Fragment>
      <Layout.CollapseList startCollapsed={false} title={<strong>Title</strong>} items={collapseListItems} />
      <Layout.CollapseList startCollapsed={true} title={<strong>Title</strong>} items={collapseListItems} />
    </React.Fragment>
  );
};
