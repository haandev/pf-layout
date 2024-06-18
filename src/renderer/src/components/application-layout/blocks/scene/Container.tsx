import React, { FC, PropsWithChildren, useRef } from 'react';
import clsx from 'clsx';
import { useDrop } from 'react-dnd';

import { isEmpty } from '../../utils';

import { AsComponentProps, Direction, IContainer, NodeType } from '../../types';

export interface ContainerProps extends PropsWithChildren, AsComponentProps<IContainer> {
  className?: string;
  direction: Direction;
  style?: React.CSSProperties;
  onDrop?: (id: string, type: NodeType, containerId: string) => void;
}

export const Container: FC<ContainerProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const [isInserting, drop] = useDrop({
    accept: [NodeType.Stack, NodeType.ToolbarWindow],
    collect: (monitor) => {
      const isOverOnlyMe = monitor.isOver({ shallow: true });
      const item = monitor.getItem();
      return (
        isOverOnlyMe &&
        (props.maxItems ? (props.members?.length || 0) < props.maxItems : true) &&
        item.direction !== props.direction
      );
    },
    drop: (item: any) => {
      if (!props.onDrop) return;
      if (
        !(props.maxItems ? (props.members?.length || 0) < props.maxItems : true) &&
        item.direction !== props.direction
      )
        return;

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
