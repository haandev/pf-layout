import React, { FC, PropsWithChildren, useRef } from 'react';
import { AsComponentProps, Direction, IToolbarStack, NodeType } from '../types';
import clsx from 'clsx';
import { evalBoolean, noDrag } from '../util';
import { useDrag } from 'react-dnd';
import { ToolbarStackDragSource } from '../types.dnd';
import { ToolbarStackHeader } from '../elements/ToolbarStackHeader';

export interface ToolbarStackProps extends PropsWithChildren, AsComponentProps<IToolbarStack> {
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
  parentId?: string;
}
export const ToolbarStack: FC<ToolbarStackProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const [isDragging, drag] = useDrag<ToolbarStackDragSource>({
    type: NodeType.ToolbarStack,
    item: () => ({
      type: NodeType.ToolbarStack,
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
    <ToolbarStackHeader
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
        [props.className || '']: true
      })}
    >
      {header}
      {props.children}
    </div>
  );
};
