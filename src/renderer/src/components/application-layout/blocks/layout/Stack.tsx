import React, { FC, PropsWithChildren, useRef } from 'react';
import { AsComponentProps, Direction, IStack, NodeType } from '../../types';
import clsx from 'clsx';
import { evalBoolean, noDrag } from '../../utils';
import { useDrag } from 'react-dnd';
import { StackDragSource } from '../../types.dnd';
import { StackHeader } from '../../elements';

export interface StackProps extends PropsWithChildren, AsComponentProps<IStack> {
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
  parentId?: string;
}
export const Stack: FC<StackProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const [isDragging, drag] = useDrag<StackDragSource>({
    type: NodeType.Stack,
    item: () => ({
      type: NodeType.Stack,
      id: props.id,
      x: rootRef.current?.getBoundingClientRect().x || 0,
      y: rootRef.current?.getBoundingClientRect().y || 0,
      direction: props.direction
    }),
    collect: (monitor) => monitor.isDragging()
  });

  drag(rootRef);

  //undefined, default behavior (visible in vertical mode, hidden in horizontal mode), true, always visible, false, always hidden
  const shouldRenderHeader = props.header === undefined ? props.direction === Direction.Vertical : props.header;

  const header = shouldRenderHeader && (
    <StackHeader
      stackId={props.id}
      parentId={props.parentId}
      onClose={props.onClose}
      onCollapse={props.onCollapse}
      onExpand={props.onExpand}
      isExpanded={evalBoolean(props.isExpanded)}
      chevronPosition={props.chevronsPosition}
    />
  );

  return (
    <div
      {...(!props.draggable ? noDrag : {})}
      ref={rootRef}
      className={clsx({
        'pf-toolbar-stack': true,
        'pf-stack': true,
        'pf-vertical': props.direction === Direction.Vertical,
        'pf-horizontal': props.direction === Direction.Horizontal,
        'pf-transparent': isDragging,
        'pf-toolbar-stack-toolbars': props.as !== 'tabs',
        'pf-toolbar-stack-tabs': props.as === 'tabs',

        [props.className || '']: true
      })}
    >
      {header}
      {props.children}
    </div>
  );
};
