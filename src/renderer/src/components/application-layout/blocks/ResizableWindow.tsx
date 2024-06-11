import { FC, PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { useValidateElement } from '../hooks'
import clsx from 'clsx'
import React from 'react'
import { useWindowSize } from 'usehooks-ts'
import { Direction } from '../types'
import useDragDelta from '../hooks/use-drag-delta'
import useEvent from 'react-use-event-hook'
import { useDrag } from 'react-dnd'
import IconXmark from '../icons/IconXmark'
import IconMinus from '../icons/IconMinus'
import IconPlus from '../icons/IconPlus'

export type OnResizeHandler = (width: number, height: number, top: number, left: number, viewPath: string[]) => void
export interface ResizableWindowProps extends PropsWithChildren {
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

export const ResizableWindow: FC<ResizableWindowProps> = React.memo(({ path, id, ...props }) => {
  const currentPath = [...(path || []), id]
  const { width = 0, height = 0 } = useWindowSize()
  const safetyMargins = { top: 50, left: 50, right: 50, bottom: 50 }
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const moveFloatingWindowHandler = useEvent((_e, xDelta, yDelta) => {
    const element = rootRef.current
    if (!element) return
    const initialRect = element.getBoundingClientRect()
    props.onWindowResize?.(props.width || 0, props.height || 0, initialRect.top + yDelta, initialRect.left + xDelta, currentPath)
  })
  const resizeHandler = useCallback(
    (_e: MouseEvent, handle: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right', xDelta: number, yDelta) => {
      if (!rootRef.current) return
      const initialRect = rootRef.current.getBoundingClientRect()
      switch (handle) {
        case 'left':
          props.onWindowResize?.(initialRect.width - xDelta, initialRect.height, initialRect.top, initialRect.left + xDelta, currentPath)
          break
        case 'right':
          props.onWindowResize?.(initialRect.width + xDelta, initialRect.height, initialRect.top, initialRect.left, currentPath)
          break
        case 'top':
          props.onWindowResize?.(initialRect.width, initialRect.height - yDelta, initialRect.top + yDelta, initialRect.left, currentPath)
          break
        case 'bottom':
          props.onWindowResize?.(initialRect.width, initialRect.height + yDelta, initialRect.top, initialRect.left, currentPath)
          break
        case 'top-left':
          props.onWindowResize?.(initialRect.width - xDelta, initialRect.height - yDelta, initialRect.top + yDelta, initialRect.left + xDelta, currentPath)
          break
        case 'top-right':
          props.onWindowResize?.(initialRect.width + xDelta, initialRect.height - yDelta, initialRect.top + yDelta, initialRect.left, currentPath)
          break
        case 'bottom-left':
          props.onWindowResize?.(initialRect.width - xDelta, initialRect.height + yDelta, initialRect.top, initialRect.left + xDelta, currentPath)
          break
        case 'bottom-right':
          props.onWindowResize?.(initialRect.width + xDelta, initialRect.height + yDelta, initialRect.top, initialRect.left, currentPath)
          break
      }
    },
    []
  )
  const leftEdge = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'left', xDelta, yDelta)
    },
    safetyMargins
  })
  const rightEdge = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'right', xDelta, yDelta)
    },
    safetyMargins
  })
  const topEdge = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'top', xDelta, yDelta)
    },
    safetyMargins
  })
  const bottomEdge = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'bottom', xDelta, yDelta)
    },
    safetyMargins
  })
  const topLeftCorner = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'top-left', xDelta, yDelta)
    },
    safetyMargins
  })
  const topRightCorner = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'top-right', xDelta, yDelta)
    },
    safetyMargins
  })
  const bottomLeftCorner = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'bottom-left', xDelta, yDelta)
    },
    safetyMargins
  })
  const bottomRightCorner = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'bottom-right', xDelta, yDelta)
    },
    safetyMargins
  })
  const header = useDragDelta<HTMLDivElement>({
    onDrag: moveFloatingWindowHandler,
    safetyMargins
  })


  const _direction = props.direction || Direction.Horizontal
  const directionClass = _direction === Direction.Horizontal ? 'pf-horizontal' : 'pf-vertical'

  //handle attached window size props while browser window resize
  useEffect(() => {
    if (props.floating) return
    const element = rootRef.current
    if (!element) return
    const visible = visibleDimension(element)
    props.onWindowResize?.(visible.width, visible.height, props.top || 0, props.left || 0, currentPath)
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
        <div className="pf-window-controls">
          <div className="pf-icon pf-icon__close">
            <IconXmark width={8} height={8}/>
          </div>
          <div className="pf-icon pf-icon__minimize">
            <IconMinus  width={8} height={8}/>
          </div>
          <div className="pf-icon pf-icon__maximize">
            <IconPlus  width={8} height={8}/>
          </div>
        </div>
        başlık
        <div></div>
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
        'pf-window-host': true,
        'pf-floating-window': props.floating,
        'pf-attached': !props.floating
      })}
      style={style}
    >
      <div className="pf-window">
        {floatingHeaderRender()}

        <div ref={leftEdge} className="pf-resize pf-resize-l" />
        <div ref={rightEdge} className="pf-resize pf-resize-r" />
        <div ref={topEdge} className="pf-resize pf-resize-t" />
        <div ref={bottomEdge} className="pf-resize pf-resize-b" />
        <div ref={topLeftCorner} className="pf-resize pf-resize-tl" />
        <div ref={topRightCorner} className="pf-resize pf-resize-tr" />
        <div ref={bottomLeftCorner} className="pf-resize pf-resize-bl" />
        <div ref={bottomRightCorner} className="pf-resize pf-resize-br" />

        <div
          ref={contentRef}
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
