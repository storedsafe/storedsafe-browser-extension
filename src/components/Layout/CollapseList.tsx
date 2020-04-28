import * as React from 'react';
import { CollapseBox } from './';
import './CollapseList.scss';

export interface CollapseListProps {
  startCollapsed?: boolean;
  title: React.ReactNode;
  items: React.ReactNode[];
  padded?: boolean;
}

export const CollapseList: React.FC<CollapseListProps> = ({
  startCollapsed,
  title,
  items,
  padded,
}: CollapseListProps) => {
  const children = items.map((item, index) => (
    <div key={index} className={`collapse-list-item${padded ? ' padded' : ''}`}>
      {item}
    </div>
  ));
  return (
    <div className="collapse-list">
      <CollapseBox padded={false} startCollapsed={startCollapsed} title={title}>
        {children}
      </CollapseBox>
    </div>
  );
}

CollapseList.defaultProps = {
  startCollapsed: true,
  padded: true,
};
