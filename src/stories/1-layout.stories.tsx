import React, { Fragment, useState } from 'react';
import { action } from '@storybook/addon-actions';
import svg from '../ico/svg';
import * as UI from '../components/common';

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

export const MenuButton: React.FunctionComponent = () => (
  <div style={{ backgroundColor: '#526a78', padding: '10px', display: 'grid', gridTemplateColumns: '1fr auto' }}>
    <div />
    <div>
      <UI.MenuButton
        title="Item 1"
        icon={svg.vault}
        onClick={action('item-1-click')}
      />
      <UI.MenuButton
        title="General Settings"
        icon={svg.settings}
        onClick={action('item-1-click')}
      />
    </div>
  </div>
);

export const ListView: React.FunctionComponent = () => {
  const items = [
    {
      key: 'foo',
      title: <p>Foo</p>,
      content: <p>This is Foo.</p>,
    },
    {
      key: 'bar',
      title: <p>Bar</p>,
      content: <p>This is Bar.</p>,
    },
    {
      key: 'zot',
      title: <p>Zot</p>,
      content: <p>This is Zot.</p>,
    },
    {
      key: 'long',
      title: <p>Long</p>,
      content: <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tempor sagittis justo, quis blandit dui. Proin ullamcorper eget purus ut pellentesque. Cras lectus enim, viverra facilisis mollis eget, cursus id nisl. Phasellus enim eros, ullamcorper et rutrum eu, hendrerit eu nibh. Quisque id aliquet justo, in ultricies ipsum. Proin scelerisque imperdiet rutrum. In hac habitasse platea dictumst. Fusce tincidunt nibh ante, ut laoreet lorem fermentum id. Sed purus ex, posuere nec tempus eu, efficitur vitae justo. Nunc varius nisi diam, ac dictum nulla accumsan ac. Ut aliquam imperdiet leo, vel tincidunt lectus. Maecenas ut massa placerat, dictum lectus non, vehicula nibh. Curabitur ullamcorper, lacus quis volutpat condimentum, lacus ante dignissim justo, vel porta nibh mauris non sapien. Quisque nec sapien tortor. In vel dictum felis.</p>,
    },
  ];

  return (
    <div style={{ backgroundColor: '#526a78', color: '#fff', padding: '10px', width: '300px', height: '300px' }}>
      <UI.ListView items={items} />
    </div>
  );
};
