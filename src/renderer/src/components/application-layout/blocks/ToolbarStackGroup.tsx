import { FC, PropsWithChildren, cloneElement, useRef } from 'react';
import { useValidateElement } from '../hooks/use-validate-element';
import clsx from 'clsx';
import { AsComponentProps, IToolbarStackGroup, NodeType } from '../types';
import { ToolbarStackGroupDragSource } from '../types.dnd';
import { useDrag } from 'react-dnd';

export interface ToolbarStackGroupProps extends PropsWithChildren, AsComponentProps<IToolbarStackGroup> {
  onClose?: () => void;
}

export const ToolbarStackGroup: FC<ToolbarStackGroupProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useValidateElement(rootRef, { $parent: { $match: '.pf-container' } }, (validation) => {
    if (!validation) {
      throw new Error('ToolbarStackGroup must be used within a Container.');
    }
  });

  const firstChild = Array.isArray(props.children) ? props.children[0] : props.children;
  const firstChildWithProps = firstChild && !firstChild.props.onClose ? cloneElement(firstChild, { onClose: props.onClose }) : firstChild;
  const [, ...rest] = Array.isArray(props.children) ? props.children : [props.children];

  const [isDragging, drag] = useDrag<ToolbarStackGroupDragSource>({
    type: NodeType.ToolbarStackGroup,
    item: { type: NodeType.ToolbarStackGroup, id: props.id },
    collect: (monitor) => monitor.isDragging()
  });

  drag(rootRef);

  const style: React.CSSProperties = {
    top: props.floating && props.top !== undefined ? `${props.top}px` : undefined,
    left: props.floating && props.left !== undefined ? `${props.left}px` : undefined,
    zIndex: (props.zIndex || 0) + 1000
  };
  return (
    !props.hidden && (
      <div
        ref={rootRef}
        className={clsx({
          'pf-toolbar-stack-group': true,
          'pf-floating': props.floating,
          'pf-half-transparent': isDragging
        })}
        style={style}
      >
        {firstChildWithProps}
        {rest}
      </div>
    )
  );
};
