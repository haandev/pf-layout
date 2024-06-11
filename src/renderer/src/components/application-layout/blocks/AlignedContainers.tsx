import React, { FC, PropsWithChildren, useRef } from 'react'
import { useValidateElement } from '../hooks/use-validate-element'
import clsx from 'clsx'
import { Direction } from '../types'

export interface AlignedContainersProps extends PropsWithChildren {
  className?: string
  style?: React.CSSProperties
  direction?: Direction
}

export const AlignedContainers: FC<AlignedContainersProps> = (props) => {
  const _direction = props.direction || Direction.Vertical
  const rootRef = useRef<HTMLDivElement>(null)

  useValidateElement(rootRef, { $parent: { $match: '.pf-app' } }, (validation) => {
    if (!validation) {
      throw new Error('AlignedContainers must be used within a ApplicationLayout.')
    }
  })

  return (
    <div
      ref={rootRef}
      className={clsx({
        'pf-aligned-containers': true,
        'pf-vertical': _direction === Direction.Vertical,
        'pf-horizontal': _direction === Direction.Horizontal,
        [props.className || '']: true
      })}
      style={props.style}
    >
      {props.children}
    </div>
  )
}
