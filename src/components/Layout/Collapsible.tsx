import * as React from 'react';
import './Collapsible.scss';

export interface CollapsibleProps {
  collapsed?: boolean;
  children: React.ReactNode;
  maxSize?: string;
  horizontal?: boolean;
}

export const Collapsible: React.FunctionComponent<CollapsibleProps> = ({
  collapsed,
  children,
  maxSize,
  horizontal,
}: CollapsibleProps) => {
  const collapsibleRef = React.useRef<HTMLDivElement>();
  const childRef = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    const child = childRef.current;
    const collapsible = collapsibleRef.current;

    const resize = (): void => {
      if (horizontal) {
        if (!collapsed) {
          if (maxSize) {
            collapsible.style.maxWidth = maxSize;
          } else {
            collapsible.style.maxWidth = `${child.clientWidth}px`;
          }
        } else {
          collapsible.style.maxWidth = '0';
        }
      } else {
        if (!collapsed) {
          if (maxSize) {
            collapsible.style.maxHeight = maxSize;
          } else {
            collapsible.style.maxHeight = `${child.clientHeight}px`;
          }
        } else {
          collapsible.style.maxHeight = '0';
        }
      }
    };

    resize();

    if (maxSize === undefined) {
      const resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(child);
      return (): void => resizeObserver.unobserve(child);
    }
  }, [collapsed, maxSize, horizontal]);

  const className = [
    'collapsible',
    horizontal ? 'horizontal' : 'vertical',
    maxSize === undefined ? '' : 'fixed',
    collapsed ? 'collapsed' : '',
  ].filter((name) => name !== '').join(' ');

  return (
    <div className={className} ref={collapsibleRef}>
      <div className="collapsible-children" ref={childRef}>
        {children}
      </div>
    </div>
  );
}

Collapsible.defaultProps = {
  collapsed: false,
  horizontal: false,
};
