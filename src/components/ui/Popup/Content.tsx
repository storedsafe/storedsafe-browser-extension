import React from 'react';
import './Content.scss';

interface ContentProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export const Content: React.FunctionComponent<ContentProps> = ({
  left,
  right,
}: ContentProps) => (
  <section className="content">
    <section className="content-left">
      {left}
    </section>
    <section className="content-right">
      {right}
    </section>
  </section>
);
