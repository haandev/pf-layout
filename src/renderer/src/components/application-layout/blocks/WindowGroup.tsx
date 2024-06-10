import { FC, PropsWithChildren, useRef } from 'react'
import { useValidateElement } from '../hooks'
import clsx from 'clsx'
import React from 'react'
import { Direction } from '../types'
import { useSizeStyle } from '../hooks/use-size-style'
import { OnResizeHandler } from './TabView'
import { ResizeHandle } from '../elements/ResizeHandle'

export interface WindowGroupProps extends PropsWithChildren {
  direction: Direction
  size?: number
  path?: number[]
  onResize?: OnResizeHandler
}

export const WindowGroup: FC<WindowGroupProps> = React.memo((props) => {
  const oppositeDirection = props.direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal

  const rootRef = useRef<HTMLDivElement>(null)

  useValidateElement(rootRef, { $parent: { $match: '.pf-container,.pf-window-group' } }, (validation) => {
    if (!validation) {
      throw new Error('WindowGroup must be used within a Container or another WindowGroup.')
    }
  })

  const onResize = (size: number) => {
    props.onResize?.(size, props.path || [0])
  }

  const style = useSizeStyle(props.size, oppositeDirection)

  return (
    <div
      ref={rootRef}
      className={clsx({
        'pf-window-group': true,
        'pf-horizontal': props.direction === Direction.Horizontal,
        'pf-vertical': props.direction === Direction.Vertical
      })}
      style={style}
    >
      <ResizeHandle direction={oppositeDirection} onResize={onResize} />
      {props.children}
    </div>
  )
})
