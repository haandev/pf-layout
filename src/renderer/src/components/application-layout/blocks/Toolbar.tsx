import React, { FC, PropsWithChildren, useRef } from 'react';
import { AsComponentProps, Direction, IToolbar } from '../types';
import clsx from 'clsx';
import { noDrag } from '../util';
import { DragHandle } from '../elements/DragHandle';

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

  const itemsStyle = {
    ...(_rows && { maxHeight: `calc(${_rows} * var(--pf-toolbar-row-size))` }),
    ...(_columns && { maxWidth: `calc(${_columns} * var(--pf-toolbar-row-size))` })
  };
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
    </div>
  );
};
