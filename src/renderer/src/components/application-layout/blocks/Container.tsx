import React, { FC, PropsWithChildren, useRef } from 'react';
import { Direction } from '../types';
import clsx from 'clsx';

export interface ContainerProps extends PropsWithChildren {
  className?: string;
  direction: Direction;
  maxItems?: number;
  id: string;
  style?: React.CSSProperties;
}

export const Container: FC<ContainerProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={rootRef}
      style={props.style}
      className={clsx({
        'pf-container': true,
        'pf-vertical': props.direction === Direction.Vertical,
        'pf-horizontal': props.direction === Direction.Horizontal,
        [props.className || '']: true
      })}
    >
      {props.children}
    </div>
  );
};
