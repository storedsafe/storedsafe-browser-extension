import * as React from 'react';
import { Collapsible } from './';
import './Menuitem.scss';

export interface MenuitemProps {
  collapsed: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
  onCollapse: () => void;
}

export const Menuitem: React.FunctionComponent<MenuitemProps> = ({
  collapsed,
  title,
  onCollapse,
  children,
}: MenuitemProps) => {
  return (
    <div className={`menu-item${collapsed ? ' collapsed' : ''}`}>
      <div className="menu-item-title" onClick={onCollapse}>
        {title}
      </div>
      <Collapsible collapsed={collapsed}>
        {children}
      </Collapsible>
    </div>
  );
}
