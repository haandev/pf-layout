import React, { FC, PropsWithChildren, useRef } from 'react';
import clsx from 'clsx';
import { useDrop } from 'react-dnd';

import { isEmpty } from '../../utils';

import { AsComponentProps, Direction, GatheredContainer, IContainer, NodeType } from '../../types';

export interface ContainerProps extends PropsWithChildren, AsComponentProps<IContainer> {
  containerInstance?: GatheredContainer;
  className?: string;
  direction: Direction;
  style?: React.CSSProperties;
  onDrop?: (id: string, type: NodeType, containerId: string) => void;
}
export const Container: FC<ContainerProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canDrop = props.canDrop || (() => true);

  const [isInserting, drop] = useDrop({
    accept: [NodeType.Stack, NodeType.ToolbarWindow],
    canDrop: (item, monitor) => {
      const isOverShallow = monitor.isOver({ shallow: true });
      return Boolean(
        isOverShallow &&
          canDrop?.(item as any, props.containerInstance as any) &&
          (props.maxItems ? (props.members?.length || 0) < props.maxItems : true) &&
          item.direction !== props.direction
      );
    },
    collect: (monitor) => {
      const item = monitor.getItem();
      const isOverShallow = monitor.isOver({ shallow: true });
      return Boolean(
        isOverShallow &&
          canDrop?.(item as any, props.containerInstance as any) &&
          (props.maxItems ? (props.members?.length || 0) < props.maxItems : true) &&
          item.direction !== props.direction
      );
    },
    drop: (item: any) => {
      if (!props.onDrop) return;

      if (item.type === NodeType.Stack) {
        props.onDrop(item.id, item.type, props.id);
      }
    }
  });
  drop(rootRef);
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

      {isInserting && <div className="pf-insert-zone" />}
      {isEmpty(props.children) && (
        <div
          className={clsx({
            'pf-container-insert-spacer': true,
            'pf-highlight': isInserting
          })}
        />
      )}
    </div>
  );
};
