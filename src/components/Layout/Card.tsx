import * as React from 'react';
import './Card.scss';

export interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
}: CardProps) => <section className={`card ${className}`}>{children}</section>
