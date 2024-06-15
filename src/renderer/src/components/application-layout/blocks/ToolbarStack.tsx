import React, { FC, PropsWithChildren, useRef } from 'react';
import { AsComponentProps, Direction, IToolbarStack, NodeType } from '../types';
import { useValidateElement } from '../hooks/use-validate-element';
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

  /*  useValidateElement(rootRef, { $parent: { $match: '.pf-toolbar-stack-group' } }, (validation) => {
    if (!validation) {
      throw new Error('ToolbarStack must be used within a FloatingToolbarWindow.');
    }
  });
 */
  let _header = props.header && !props.header.props.onClose ? React.cloneElement(props.header, { onClose: props.onClose }) : props.header;

  return (
    <div
      {...(!props.draggable ? noDrag : {})}
      ref={rootRef}
      className={clsx({
        'pf-toolbar-stack': true,
        'pf-stack': true,
        'pf-vertical': props.direction === Direction.Vertical,
        'pf-horizontal': props.direction === Direction.Horizontal,
        [props.className || '']: true
      })}
    >
      {_header}
      {props.children}
    </div>
  );
};
