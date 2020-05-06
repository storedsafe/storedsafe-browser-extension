// import React, { useState } from 'react';
// import * as Layout from '../components/Layout';

// export default {
  // title: 'Layout',
  // component: Layout,
// };

// export const Message: React.FunctionComponent = () => (
  // <Layout.Card>
    // <Layout.Message type="info">
      // Message Info
    // </Layout.Message>
    // <Layout.Message type="warning">
      // Message Warning
    // </Layout.Message>
    // <Layout.Message type="error">
      // Message Error
    // </Layout.Message>
  // </Layout.Card>
// );

// export const LoadingSpinner: React.FunctionComponent = () => {
  // const [status, setStatus] = useState<'loading' | 'error' | 'warning' | 'success'>('loading');
  // return (
    // <Layout.Card>
      // <Layout.LoadingSpinner />
      // <Layout.LoadingSpinner status="error" />
      // <Layout.LoadingSpinner status="warning" />
      // <Layout.LoadingSpinner status="success" />
      // <Layout.LoadingSpinner status={status} />
      // <button onClick={(): void => setStatus('loading')}>Loading</button>
      // <button onClick={(): void => setStatus('error')}>Error</button>
      // <button onClick={(): void => setStatus('warning')}>Warning</button>
      // <button onClick={(): void => setStatus('success')}>Success</button>
    // </Layout.Card>
  // );
// };

// export const OnlineIndicator: React.FunctionComponent = () => {
  // const [online, setOnline] = useState<boolean>(true);
  // return (
    // <Layout.Card>
      // <Layout.OnlineIndicator online={true} />
      // <Layout.OnlineIndicator online={false} />
      // <Layout.OnlineIndicator online={online} />
      // <button onClick={(): void => setOnline(true)}>Online</button>
      // <button onClick={(): void => setOnline(false)}>Offline</button>
    // </Layout.Card>
  // );
// };

// export const Collapsible: React.FunctionComponent = () => {
  // const [collapsed, setCollapsed] = useState<boolean>(false);
  // return (
    // <Layout.Card>
      // <button onClick={(): void => setCollapsed(!collapsed)}>Collapse</button>
      // <Layout.Collapsible collapsed={collapsed}>
        // <div style={{ backgroundColor: '#f93', color: '#fff' }}>
          // <p>Foo</p>
          // <p>Bar</p>
          // <p>Zot</p>
        // </div>
      // </Layout.Collapsible>
      // <Layout.Collapsible collapsed={false}>
        // <div style={{ backgroundColor: '#36f', color: '#fff' }}>
          // <p>Foo</p>
          // <p>Bar</p>
          // <p>Zot</p>
          // <Layout.Collapsible collapsed={collapsed}>
            // <div style={{ backgroundColor: '#fff', color: '#000' }}>
              // <p>Foo</p>
              // <p>Bar</p>
              // <p>Zot</p>
            // </div>
          // </Layout.Collapsible>
        // </div>
      // </Layout.Collapsible>
      // <Layout.Collapsible collapsed={!collapsed}>
        // <div style={{ backgroundColor: '#000', color: '#fff' }}>
          // <p>Foo</p>
          // <p>Bar</p>
          // <p>Zot</p>
        // </div>
      // </Layout.Collapsible>
    // </Layout.Card>
  // );
// };

// export const CollapseBox: React.FunctionComponent = () => (
  // <Layout.Card>
    // <Layout.CollapseBox startCollapsed={false} title={<strong>Title</strong>}>
      // <p>Foo</p>
      // <p>Bar</p>
      // <p>Zot</p>
    // </Layout.CollapseBox>
    // <Layout.CollapseBox startCollapsed={true} title={<strong>Title</strong>}>
      // <p>Foo</p>
      // <p>Bar</p>
      // <p>Zot</p>
    // </Layout.CollapseBox>
  // </Layout.Card>
// );

// export const CollapseList: React.FunctionComponent = () => {
  // const collapseListItems = [
  // <p key={0}>Foo</p>,
  // <p key={1}>Bar</p>,
  // <p key={2}>Zot</p>
  // ];
  // const extra = <p key={3}>Extra</p>;
  // return (
    // <Layout.Card>
      // <Layout.CollapseList startCollapsed={false} title={<strong>Title</strong>} items={collapseListItems} />
      // <Layout.CollapseList startCollapsed={false} title={<strong>Title</strong>} items={[...collapseListItems, extra]} />
      // <Layout.CollapseList startCollapsed={true} title={<strong>Title</strong>} items={collapseListItems} />
    // </Layout.Card>
  // );
// };

// export const Logo: React.FunctionComponent = () => (
  // <React.Fragment>
    // <Layout.Logo />
    // <Layout.Card>
      // <Layout.Logo />
    // </Layout.Card>
  // </React.Fragment>
// );
