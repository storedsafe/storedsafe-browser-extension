import React from 'react';
import './Menu.scss';

interface MenuItemProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
}

const MenuItem: React.FunctionComponent<MenuItemProps> = ({
  title,
  icon,
  onClick,
  selected
}: MenuItemProps) => (
  <div className={`menu-item ${selected ? ' selected' : ''}`} onClick={onClick}>
    <div className="menu-item-icon">{icon}</div>
    <span className="menu-item-title">{title}</span>
  </div>
);

MenuItem.defaultProps = {
  selected: false,
};

interface MenuProps {
  items: {
    title: string;
    icon: React.ReactNode;
  }[];
  onClick: (id: number) => void;
  selected: number;
}

export const Menu: React.FunctionComponent<MenuProps> = ({
  items,
  selected,
  onClick,
}: MenuProps) => (
  <section className="menu">
    {items.map((menuItem, index) => (
      <MenuItem
        key={index}
        {...menuItem}
        onClick={(): void => onClick(index)}
        selected={index === selected}
      />
    ))}
  </section>
);
