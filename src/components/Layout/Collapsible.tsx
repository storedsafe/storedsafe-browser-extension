import * as React from 'react';
import './Collapsible.scss';

export interface CollapsibleProps {
  collapsed?: boolean;
  children: React.ReactNode;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  collapsed,
  children,
}: CollapsibleProps) => {
  const collapsibleRef = React.useRef<HTMLDivElement>();
  const childRef = React.useRef<HTMLDivElement>();


  React.useEffect(() => {
    const child = childRef.current;
    const collapsible = collapsibleRef.current;

    const resize = (): void => {
      if (!collapsed) {
        collapsible.style.maxHeight = `${child.clientHeight}px`;
      } else {
        collapsible.style.maxHeight = '0';
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(child);
    return (): void => resizeObserver.unobserve(child);
  }, [collapsed]);

  return (
    <div className={`collapsible${collapsed ? ' collapsed' : ''}`} ref={collapsibleRef}>
      <div className="collapsible-children" ref={childRef}>
        {children}
      </div>
    </div>
  );
}

Collapsible.defaultProps = {
  collapsed: false,
};
