import { FC, PropsWithChildren, useRef } from 'react'
import { useValidateElement } from '../hooks'
import clsx from 'clsx'
import React from 'react'
import { Direction } from '../types'
import { useSizeStyle } from '../hooks/use-size-style'
import { OnSplitResizeHandler } from './TabView'
import { SplitResizeHandle } from '../elements/SplitResizeHandle'

export interface ViewGroupProps extends PropsWithChildren {
  direction: Direction
  width?: number
  height?: number
  path?: number[]
  onResize?: OnSplitResizeHandler
}

export const ViewGroup: FC<ViewGroupProps> = React.memo((props) => {
  const oppositeDirection = props.direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal

  const rootRef = useRef<HTMLDivElement>(null)

  useValidateElement(rootRef, { $parent: { $match: '.pf-container,.pf-view-group,.pf-resizable-window_content' } }, (validation) => {
    if (!validation) {
      throw new Error('ViewGroup must be used within a Container or another ViewGroup.')
    }
  })

  const onResize = (size: number, nextItemSize?: number) => {
    props.onResize?.(oppositeDirection, size, props.path || [0], nextItemSize)
  }
  const style = {
    width: props.width,
    height: props.height
  }
  return (
    <div
      ref={rootRef}
      className={clsx({
        'pf-view-group': true,
        'pf-horizontal': props.direction === Direction.Horizontal,
        'pf-vertical': props.direction === Direction.Vertical
      })}
      style={style}
    >
      <SplitResizeHandle direction={oppositeDirection} onResize={onResize} />
      {props.children}
    </div>
  )
})
