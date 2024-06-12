import React, { FC, PropsWithChildren, useEffect, useRef } from 'react'
import clsx from 'clsx'
import useEvent from 'react-use-event-hook'
import { useWindowSize } from 'usehooks-ts'
import { useDrag } from 'react-dnd'

import { Direction } from '../types'
import { useValidateElement, useDragDelta } from '..'
import IconXmark from '../icons/IconXmark'
import IconMinus from '../icons/IconMinus'
import IconPlus from '../icons/IconPlus'
import { UseBoxResizeHandler } from '../hooks/use-box-resize'
import ResizeBox from '../elements/ResizeBox'

export type OnResizeHandler = (width: number, height: number, top: number, left: number, viewPath: string[]) => void
export interface WindowProps extends PropsWithChildren {
  onWindowResize?: OnResizeHandler
  direction?: Direction
  floating?: boolean
  width?: number
  height?: number
  top?: number
  left?: number
  id: string
  path?: string[]
}

export const Window: FC<WindowProps> = React.memo(({ path, id, ...props }) => {
  //validate parent
  const rootRef = useRef<HTMLDivElement>(null)
  useValidateElement(rootRef, { $parent: { $match: '.pf-container,.pf-view-group' } }, (validation) => {
    if (!validation) {
      throw new Error('Window must be used within a Container or another Window.')
    }
  })

  //concat path
  const currentPath = [...(path || []), id]

  //handle attached window size props while browser window resize
  const { width = 0, height = 0 } = useWindowSize()
  useEffect(() => {
    if (props.floating) return
    const element = rootRef.current
    if (!element) return
    const visible = visibleDimension(element)
    props.onWindowResize?.(visible.width, visible.height, props.top || 0, props.left || 0, currentPath)
  }, [width, height, props.floating])

  //handle resize floating window
  const resizeBoxHandler: UseBoxResizeHandler = (_e, ...args) => {
    props.onWindowResize?.(...args, currentPath)
  }

  //handle floating window move
  const moveFloatingWindowHandler = useEvent((_e, xDelta, yDelta) => {
    const element = rootRef.current
    if (!element) return
    const initialRect = element.getBoundingClientRect()
    props.onWindowResize?.(props.width || 0, props.height || 0, initialRect.top + yDelta, initialRect.left + xDelta, currentPath)
  })

  const header = useDragDelta<HTMLDivElement>({
    onDrag: moveFloatingWindowHandler,
    safetyMargins: { top: 50, left: 50, right: 50, bottom: 50 }
  })
  const header2 = useRef<HTMLDivElement>(null)
  const [, drag] = useDrag({
    type: 'window',
    item: {
      id
    }
  })

  //drag(header)
  const _direction = props.direction || Direction.Horizontal
  const directionClass = _direction === Direction.Horizontal ? 'pf-horizontal' : 'pf-vertical'

  const floatingHeaderRender = () => {
    if (!props.floating) return null
    return (
      <div ref={header} className="pf-floating-window_header">
        <div className="pf-window-controls no-drag">
          <div className="pf-icon pf-icon__close">
            <IconXmark width={8} height={8} />
          </div>
          <div className="pf-icon pf-icon__minimize">
            <IconMinus width={8} height={8} />
          </div>
          <div className="pf-icon pf-icon__maximize">
            <IconPlus width={8} height={8} />
          </div>
        </div>
        <span></span>
      </div>
    )
  }

  const styleFloating: React.CSSProperties = {
    top: props.floating && props.top ? `${props.top}px` : undefined,
    left: props.floating && props.left ? `${props.left}px` : undefined,
    width: props.width ? `${props.width}px` : undefined,
    height: props.height ? `${props.height}px` : undefined
  }

  const styleAttached: React.CSSProperties = {
    width: props.width ? `${props.width}px` : undefined,
    minHeight: props.height ? `${props.height}px` : undefined
  }

  return (
    <div
      ref={rootRef}
      className={clsx({
        'pf-window-host': true,
        'pf-floating-window': props.floating,
        'pf-attached': !props.floating
      })}
      style={props.floating ? styleFloating : styleAttached}
    >
      <div className="pf-window">
        {floatingHeaderRender()}

        {props.floating && <ResizeBox ref={rootRef} handler={resizeBoxHandler} safetyMargins={{ top: 50, left: 50, right: 50, bottom: 50 }} />}

        <div
          className={clsx({
            'pf-window_content': true,
            [directionClass]: true
          })}
        >
          {props.children}
        </div>
      </div>
    </div>
  )
})

const calculateVisibleDimension = (totalSize, position, clientSize) => {
  const endPosition = position + totalSize
  if (endPosition > clientSize) {
    return Math.max(0, clientSize - position)
  }
  return totalSize
}
const visibleDimension = (element) => {
  const rect = element.getBoundingClientRect()
  const clientWidth = document.documentElement.clientWidth
  const clientHeight = document.documentElement.clientHeight
  const width = calculateVisibleDimension(rect.width, rect.left, clientWidth)
  const height = calculateVisibleDimension(rect.height, rect.top, clientHeight)
  return { width, height }
}
