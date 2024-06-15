import { FC, PropsWithChildren, useRef } from 'react';
import { useValidateElement } from '../hooks/use-validate-element';
import clsx from 'clsx';
import React from 'react';
import { Direction } from '../types';
import { SplitResizeHandle } from '../elements/SplitResizeHandle';
import { SceneStore } from '../stores/scene-store';

export interface ViewGroupProps extends PropsWithChildren {
  store: SceneStore;
  direction: Direction;
  width?: number;
  height?: number;
  id: string;
}

export const ViewGroup: FC<ViewGroupProps> = React.memo(({ id, store, ...props }) => {
  const oppositeDirection = props.direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
  const rootRef = useRef<HTMLDivElement>(null);

  useValidateElement(rootRef, { $parent: { $match: '.pf-view-group,.pf-window__content' } }, (validation) => {
    if (!validation) {
      throw new Error('ViewGroup must be used within a Window or another ViewGroup.');
    }
  });

  const onResize = (size: number, nextItemSize?: number) => {
    store.resizeView(oppositeDirection, size, id, nextItemSize);
  };

  const style = {
    width: props.width,
    minWidth: props.width,
    height: props.height,
    minHeight: props.height
  };
  return (
    <div
      ref={rootRef}
      className={clsx({
        'pf-view-group': true,
        'pf-horizontal': props.direction === Direction.Horizontal,
        'pf-vertical': props.direction === Direction.Vertical
      })}
      style={style}
    >
      <SplitResizeHandle direction={oppositeDirection} onResize={onResize} />
      {props.children}
    </div>
  );
});
