import * as React from 'react';
import { Collapsible } from './';
import './CollapseBox.scss';

export interface CollapseBoxProps {
  startCollapsed?: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
  padded?: boolean;
}

export const CollapseBox: React.FunctionComponent<CollapseBoxProps> = ({
  startCollapsed,
  title,
  children,
  padded,
}: CollapseBoxProps) => {
  const [collapsed, setCollapsed] = React.useState<boolean>(startCollapsed);

  return (
    <div className={`collapse-box${collapsed ? ' collapsed' : ''}`}>
      <div className="collapse-box-title" onClick={(): void => setCollapsed(!collapsed)}>
        {title}
      </div>
      <Collapsible collapsed={collapsed}>
        <div className={`collapse-box-children${padded ? ' padded' : ''}`}>
          {children}
        </div>
      </Collapsible>
    </div>
  );
}

CollapseBox.defaultProps = {
  startCollapsed: true,
  padded: true,
};
