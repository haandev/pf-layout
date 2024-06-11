import React, { FC, PropsWithChildren, useRef } from 'react'
import { useValidateElement } from '../hooks/use-validate-element'
import { Direction } from '../types'
import clsx from 'clsx'

export interface ToolbarProps extends PropsWithChildren {
  name: string
  direction: Direction
  className?: string
  dragHandle?: React.ReactNode
  style?: React.CSSProperties
  maxItems?: number
  rows?: number
  columns?: number
}
export const Toolbar: FC<ToolbarProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null)

  useValidateElement(rootRef, { $parent: { $match: '.pf-toolbar-stack' } }, (validation) => {
    if (!validation) {
      throw new Error('Toolbar must be used within a ToolbarStack.')
    }
  })

  // If the direction is horizontal and rows are not set, set rows to 1
  const _rows = props.direction === Direction.Horizontal && !props.rows ? 1 : props.rows

  // If the direction is vertical and columns are not set, set columns to 1
  const _columns = props.direction === Direction.Vertical && !props.columns ? 1 : props.columns

  const itemsStyle = {
    ...(_rows && { maxHeight: `calc(${_rows} * var(--toolbar-row-size))` }),
    ...(_columns && { maxWidth: `calc(${_columns} * var(--toolbar-row-size))` })
  }
  return (
    <div
      ref={rootRef}
      className={clsx({
        'pf-toolbar': true,
        'pf-vertical': props.direction === Direction.Vertical,
        'pf-horizontal': props.direction === Direction.Horizontal,
        [props.className || '']: true
      })}
    >
      {props.dragHandle || null}
      <div
        className={clsx({ 'pf-toolbar-items': true })}
        style={itemsStyle}
      >
        {props.children}
      </div>
    </div>
  )
}
