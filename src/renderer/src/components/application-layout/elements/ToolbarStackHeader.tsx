import React, { FC, useRef } from 'react'
import clsx from 'clsx'
import { useValidateElement } from '../hooks'

export interface ToolbarStackHeaderProps {
  left?: React.ReactNode | React.ReactNode[]
  right?: React.ReactNode | React.ReactNode[]
}
export const ToolbarStackHeader: FC<ToolbarStackHeaderProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null)

  useValidateElement(rootRef, { $parent: { $match: '.pf-toolbar-stack' } }, (validation) => {
    if (!validation) {
      throw new Error('ToolbarStackHeader must be used within a ToolbarStack.')
    }
  })

  const _left = Array.isArray(props.left) ? props.left.filter(Boolean) : [props.left]
  const _right = Array.isArray(props.right) ? props.right.filter(Boolean) : [props.right]

  return (
    <div
      ref={rootRef}
      className={clsx({
        'pf-toolbar-stack-header': true
      })}
    >
      <div className='pf-stack-header-left'>{_left}</div>
      <div className='pf-stack-header-right'>{_right}</div>
    </div>
  )
}
