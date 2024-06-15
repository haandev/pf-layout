import React, { FC, PropsWithChildren, useRef } from 'react';
import { AsComponentProps, Direction, IToolbarStack, NodeType } from '../types';
import clsx from 'clsx';
import { noDrag } from '../util';
import { useDrag } from 'react-dnd';
import { ToolbarStackDragSource } from '../types.dnd';

export interface ToolbarStackProps extends PropsWithChildren, AsComponentProps<IToolbarStack> {
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
}
export const ToolbarStack: FC<ToolbarStackProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const [isDragging, drag] = useDrag<ToolbarStackDragSource>({
    type: NodeType.ToolbarStack,
    item: () => ({
      type: NodeType.ToolbarStack,
      id: props.id,
      x: rootRef.current?.getBoundingClientRect().x || 0,
      y: rootRef.current?.getBoundingClientRect().y || 0
    }),
    collect: (monitor) => monitor.isDragging()
  });

  drag(rootRef);

  const headerRender = typeof props.header === 'function' ? props.header() : props.header;
  let _header = headerRender && !headerRender.props.onClose ? React.cloneElement(headerRender, { onClose: props.onClose }) : headerRender;

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
      {_header}
      {props.children}
    </div>
  );
};
