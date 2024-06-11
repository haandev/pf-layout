import { FC, PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { useValidateElement } from '../hooks'
import clsx from 'clsx'
import React from 'react'
import { useResizeObserver, useWindowSize } from 'usehooks-ts'
import { Direction } from '../types'
import useWindowResize from '@renderer/hooks/use-window-resize'
import useDragDelta from '../hooks/use-drag-delta'
import useEvent from 'react-use-event-hook'

export type OnResizeHandler = (width: number, height: number, top: number, left: number, viewPath: number[]) => void
export interface ResizableWindowProps extends PropsWithChildren {
  onWindowResize?: OnResizeHandler
  direction?: Direction
  floating?: boolean
  width?: number
  height?: number
  top?: number
  left?: number
  index?: number
  path?: number[]
}

export const ResizableWindow: FC<ResizableWindowProps> = React.memo((props) => {
  const _path = props.path || [props.index || 0]
  const { width = 0, height = 0 } = useWindowSize()
  const safetyPaddings = {
    top: 50,
    left: 50,
    right: 50,
    bottom: 50
  }
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const moveFloatingWindowHandler = useEvent((e, xDelta, yDelta) => {
    const isSafeMove =
      e.clientX > safetyPaddings.left &&
      e.clientX < window.innerWidth - safetyPaddings.right &&
      e.clientY > safetyPaddings.top &&
      e.clientY < window.innerHeight - safetyPaddings.bottom
    if (!isSafeMove) return
    const element = rootRef.current
    if (!element) return
    const initialRect = element.getBoundingClientRect()
    props.onWindowResize?.(props.width || 0, props.height || 0, initialRect.top + yDelta, initialRect.left + xDelta, _path)
  })
  const resizeHandler = useCallback(
    (e: MouseEvent, handle: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right', xDelta: number, yDelta) => {
      const isSafeMove =
        e.clientX > safetyPaddings.left &&
        e.clientX < window.innerWidth - safetyPaddings.right &&
        e.clientY > safetyPaddings.top &&
        e.clientY < window.innerHeight - safetyPaddings.bottom
      if (!isSafeMove) return
      if (!rootRef.current) return
      const initialRect = rootRef.current.getBoundingClientRect()
      switch (handle) {
        case 'left':
          props.onWindowResize?.(initialRect.width - xDelta, initialRect.height, initialRect.top, initialRect.left + xDelta, _path)
          break
        case 'right':
          props.onWindowResize?.(initialRect.width + xDelta, initialRect.height, initialRect.top, initialRect.left, _path)
          break
        case 'top':
          props.onWindowResize?.(initialRect.width, initialRect.height - yDelta, initialRect.top + yDelta, initialRect.left, _path)
          break
        case 'bottom':
          props.onWindowResize?.(initialRect.width, initialRect.height + yDelta, initialRect.top, initialRect.left, _path)
          break
        case 'top-left':
          props.onWindowResize?.(initialRect.width - xDelta, initialRect.height - yDelta, initialRect.top + yDelta, initialRect.left + xDelta, _path)
          break
        case 'top-right':
          props.onWindowResize?.(initialRect.width + xDelta, initialRect.height - yDelta, initialRect.top + yDelta, initialRect.left, _path)
          break
        case 'bottom-left':
          props.onWindowResize?.(initialRect.width - xDelta, initialRect.height + yDelta, initialRect.top, initialRect.left + xDelta, _path)
          break
        case 'bottom-right':
          props.onWindowResize?.(initialRect.width + xDelta, initialRect.height + yDelta, initialRect.top, initialRect.left, _path)
          break
      }
    },
    []
  )
  const leftEdge = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'left', xDelta, yDelta)
    }
  })
  const rightEdge = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'right', xDelta, yDelta)
    }
  })
  const topEdge = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'top', xDelta, yDelta)
    }
  })
  const bottomEdge = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'bottom', xDelta, yDelta)
    }
  })
  const topLeftCorner = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'top-left', xDelta, yDelta)
    }
  })
  const topRightCorner = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'top-right', xDelta, yDelta)
    }
  })
  const bottomLeftCorner = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'bottom-left', xDelta, yDelta)
    }
  })
  const bottomRightCorner = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'bottom-right', xDelta, yDelta)
    }
  })
  const header = useDragDelta<HTMLDivElement>({
    onDrag: moveFloatingWindowHandler
  })

  const _direction = props.direction || Direction.Horizontal
  const directionClass = _direction === Direction.Horizontal ? 'pf-horizontal' : 'pf-vertical'

  //handle attached window size props while browser window resize
  useEffect(() => {
    if (props.floating) return
    const element = rootRef.current
    if (!element) return
    const visible = visibleDimension(element)
    props.onWindowResize?.(visible.width, visible.height, props.top || 0, props.left || 0, _path)
  }, [width, height, props.floating])

  useValidateElement(rootRef, { $parent: { $match: '.pf-container,.pf-view-group' } }, (validation) => {
    if (!validation) {
      throw new Error('ResizableWindow must be used within a Container or another ResizableWindow.')
    }
  })

  const floatingHeaderRender = () => {
    if (!props.floating) return null
    return (
      <div ref={header} className="pf-floating-window_header">
        başlık
      </div>
    )
  }

  const style: React.CSSProperties = {
    top: props.floating && props.top ? `${props.top}px` : undefined,
    left: props.floating && props.left ? `${props.left}px` : undefined,
    width: props.width ? `${props.width}px` : undefined,
    height: props.height ? `${props.height}px` : undefined
  }

  return (
    <div
      ref={rootRef}
      className={clsx({
        'pf-resizable-window-host': true,
        'pf-floating-window': props.floating,
        'pf-attached': !props.floating
      })}
      style={style}
    >
      <div className="pf-resizable-window">
        {floatingHeaderRender()}
        <div className="pf-edges">
          <div ref={leftEdge} className="pf-left-edge" />
          <div ref={rightEdge} className="pf-right-edge" />
          <div ref={topEdge} className="pf-top-edge" />
          <div ref={bottomEdge} className="pf-bottom-edge" />
          <div ref={topLeftCorner} className="pf-top-left-corner" />
          <div ref={topRightCorner} className="pf-top-right-corner" />
          <div ref={bottomLeftCorner} className="pf-bottom-left-corner" />
          <div ref={bottomRightCorner} className="pf-bottom-right-corner" />
        </div>

        <div
          ref={contentRef}
          className={clsx({
            'pf-resizable-window_content': true,
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
