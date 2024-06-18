import React, { CSSProperties, FC, PropsWithChildren, useRef } from 'react';
import { AsComponentProps, Direction, IToolbar, NodeType } from '../../types';
import clsx from 'clsx';
import { noDrag } from '../../utils';
import { DragHandle } from '../../elements';
import { useDrag } from 'react-dnd';
import { ToolbarDragSource } from '../../types.dnd';

export interface ToolbarProps extends PropsWithChildren, AsComponentProps<IToolbar> {
  className?: string;
  style?: React.CSSProperties;
}
export const Toolbar: FC<ToolbarProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  // If the direction is horizontal and rows are not set, set rows to 1
  const _rows = props.direction === Direction.Horizontal && props.rows;

  // If the direction is vertical and columns are not set, set columns to 1
  const _columns = props.direction === Direction.Vertical && props.columns;

  const itemsStyle: CSSProperties = {
    ...(_rows && { maxHeight: `calc(${_rows} * var(--pf-toolbar-row-size))` }),
    ...(_columns && { maxWidth: `calc(${_columns} * var(--pf-toolbar-row-size))` })
  };

  const [isDragging, drag] = useDrag<ToolbarDragSource>({
    type: NodeType.Toolbar,
    item: () => ({
      type: NodeType.Toolbar,
      id: props.id,
      direction: props.direction || Direction.Vertical
    }),
    collect: (monitor) => monitor.isDragging()
  });

  drag(rootRef);

  const panel = props.members?.find((member) => member.id === props.stackActivePanelId);
  const willRenderPanel = props.stackAs === 'tabs' ? true : panel && panel.id === props.stackActivePanelId;

  return (
    <div
      /*   {...(!props.draggable ? noDrag : {})} */
      ref={rootRef}
      className={clsx({
        'pf-toolbar': true,
        'pf-vertical': props.direction === Direction.Vertical,
        'pf-horizontal': props.direction === Direction.Horizontal,
        'pf-full-size': props.fullSize,
        [props.className || '']: true
      })}
    >
      {props.showHandle ? props.dragHandle || <DragHandle /> : null}
      <div className={clsx({ 'pf-toolbar-items': true })} style={itemsStyle} {...noDrag}>
        {props.children}
      </div>
      {willRenderPanel && <div className="pf-panel-host">{panel?.content}</div>}
    </div>
  );
};
