import React, { FC, PropsWithChildren, useRef } from 'react'
import { Direction } from '../types'
import { useValidateElement } from '../hooks/use-validate-element'
import clsx from 'clsx'

export interface ToolbarStackProps extends PropsWithChildren {
  className?: string
  direction?: Direction
  maxItems?: number
  name: string
  style?: React.CSSProperties
  header?: React.ReactElement
  onClose?: () => void
}
export const ToolbarStack: FC<ToolbarStackProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null)

  useValidateElement(rootRef, { $parent: { $match: '.pf-toolbar-stack-group' } }, (validation) => {
    if (!validation) {
      throw new Error('ToolbarStack must be used within a ToolbarStackGroup.')
    }
  })

  let _header = props.header && !props.header.props.onClose ? React.cloneElement(props.header, { onClose: props.onClose }) : props.header

  return (
    <div
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
  )
}
