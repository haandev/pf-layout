import { FC, PropsWithChildren, cloneElement, useRef } from 'react';
import clsx from 'clsx';
import { AsComponentProps, IToolbarWindow, NodeType } from '../types';
import { useDrag } from 'react-dnd';
import { ToolbarWindowDragSource } from '../types.dnd';

export interface ToolbarWindowEvents {
  onClose?: () => void;
}
export interface ToolbarWindowProps extends PropsWithChildren, AsComponentProps<IToolbarWindow>, ToolbarWindowEvents {}

export const ToolbarWindow: FC<ToolbarWindowProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const firstChild = Array.isArray(props.children) ? props.children[0] : props.children;
  const firstChildWithProps = firstChild && !firstChild.props.onClose ? cloneElement(firstChild, { onClose: props.onClose }) : firstChild;
  const [, ...rest] = Array.isArray(props.children) ? props.children : [props.children];

  const [isDragging, drag] = useDrag<ToolbarWindowDragSource>({
    type: NodeType.ToolbarWindow,
    item: { type: NodeType.ToolbarWindow, id: props.id },
    collect: (monitor) => monitor.isDragging()
  });

  drag(rootRef);

  const style: React.CSSProperties = {
    top: props.top !== undefined ? `${props.top}px` : undefined,
    left: props.left !== undefined ? `${props.left}px` : undefined,
    zIndex: (props.zIndex || 0) + 1000
  };
  return (
    !props.hidden && (
      <div
        ref={rootRef}
        className={clsx({
          'pf-floating-toolbar-window': true,
          'pf-transparent': isDragging
        })}
        style={style}
      >
        {firstChildWithProps}
        {rest}
      </div>
    )
  );
};
