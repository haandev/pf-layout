import React, { FC, PropsWithChildren, useRef } from 'react';
import { Direction } from '../types';
import clsx from 'clsx';
import { useValidateElement } from '../hooks/use-validate-element';

export interface ContainerProps extends PropsWithChildren {
  className?: string;
  direction: Direction;
  maxItems?: number;
  name: string;
  style?: React.CSSProperties;
}

export const Container: FC<ContainerProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useValidateElement(rootRef, { $parent: { $match: '.pf-app' } }, (validation) => {
    if (!validation) {
      throw new Error('Container must be used within a ApplicationLayout.');
    }
  });

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
