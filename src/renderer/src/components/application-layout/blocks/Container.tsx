import React, { FC, PropsWithChildren, useRef } from 'react';
import { AsComponentProps, Direction, IContainer, NodeType } from '../types';
import clsx from 'clsx';
import { useDrop } from 'react-dnd';
import { isEmpty } from '../util';

export interface ContainerProps extends PropsWithChildren, AsComponentProps<IContainer> {
  className?: string;
  direction: Direction;
  style?: React.CSSProperties;
  onDrop?: (id: string, containerId: string) => void;
}

export const Container: FC<ContainerProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const [isInserting, drop] = useDrop({
    accept: [NodeType.ToolbarStack, NodeType.FloatingToolbarWindow],
    collect: (monitor) => {
      const isOverOnlyMe = monitor.isOver({ shallow: true });
      return isOverOnlyMe;
    },
    drop: (item: any) => {
      console.log('dropped', item.id, props.id, item.type);

      if (item.type === NodeType.ToolbarStack) {
        if (props.onDrop) {
          console.log('dropped', item.id, props.id);
          props.onDrop(item.id, props.id);
        }
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
