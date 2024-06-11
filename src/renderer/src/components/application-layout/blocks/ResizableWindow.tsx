import { FC, PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { useValidateElement } from '../hooks'
import clsx from 'clsx'
import React from 'react'
import { useResizeObserver, useWindowSize } from 'usehooks-ts'
import { Direction } from '../types'
import useWindowResize from '@renderer/hooks/use-window-resize'

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

  const rootRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const moveWindowRef = useRef<HTMLDivElement>(null)

  const resizeHandler = useCallback(
    (e: MouseEvent) => {
      console.log(e.currentTarget)

      const element = resizeRef.current
      const content = rootRef.current
      if (!element || !content) return

      const initialRect = content.getBoundingClientRect()

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = { xPos: 0, yPos: 0, width: 0, height: 0 }
        const handle = e.target as HTMLDivElement
        if (handle.classList.contains('pf-left-edge')) {
          delta.xPos = moveEvent.clientX - e.clientX
          delta.width = -delta.xPos
        }
        if (handle.classList.contains('pf-right-edge')) {
          delta.width = moveEvent.clientX - initialRect.right
        }
        if (handle.classList.contains('pf-top-edge')) {
          delta.yPos = moveEvent.clientY - e.clientY
          delta.height = -delta.yPos
        }
        if (handle.classList.contains('pf-bottom-edge')) {
          delta.height = moveEvent.clientY - initialRect.bottom
        }
        if (handle.classList.contains('pf-top-left-corner')) {
          delta.xPos = moveEvent.clientX - e.clientX
          delta.yPos = moveEvent.clientY - e.clientY
          delta.width = -delta.xPos
          delta.height = -delta.yPos
        }
        if (handle.classList.contains('pf-top-right-corner')) {
          delta.yPos = moveEvent.clientY - e.clientY
          delta.width = moveEvent.clientX - initialRect.right
          delta.height = -delta.yPos
        }
        if (handle.classList.contains('pf-bottom-left-corner')) {
          delta.xPos = moveEvent.clientX - e.clientX
          delta.width = -delta.xPos
          delta.height = moveEvent.clientY - initialRect.bottom
        }
        if (handle.classList.contains('pf-bottom-right-corner')) {
          delta.width = moveEvent.clientX - initialRect.right
          delta.height = moveEvent.clientY - initialRect.bottom
        }
        const result = {
          width: initialRect.width + delta.width,
          height: initialRect.height + delta.height,
          top: initialRect.top + delta.yPos,
          left: initialRect.left + delta.xPos
        }
        console.log('here getting fired')
        props.onWindowResize?.(result.width, result.height, result.top, result.left, _path)
      }

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }

      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    },
    [props.onWindowResize]
  )

  const windowMoveHandler = useCallback(
    (e: MouseEvent) => {
      const element = moveWindowRef.current
      if (!element) return
      const initialRect = element.getBoundingClientRect()
      const initialX = e.clientX
      const initialY = e.clientY

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - initialX
        const deltaY = moveEvent.clientY - initialY
        const result = {
          top: initialRect.top + deltaY,
          left: initialRect.left + deltaX
        }
        props.onWindowResize?.(props.width || 0, props.height || 0, result.top, result.left, _path)
      }

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }

      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    },
    [props.onWindowResize,props.width,props.height]
  )

  useEffect(() => {
    const element = resizeRef.current
    const moveElement = moveWindowRef.current
    element?.addEventListener('mousedown', resizeHandler)
    moveElement?.addEventListener('mousedown', windowMoveHandler)
    return () => {
      element?.removeEventListener('mousedown', resizeHandler)
      moveElement?.removeEventListener('mousedown', windowMoveHandler)
    }
  }, [resizeHandler, windowMoveHandler])

  const _direction = props.direction || Direction.Horizontal
  const directionClass = _direction === Direction.Horizontal ? 'pf-horizontal' : 'pf-vertical'

  useEffect(() => {
    if (props.floating) return
    const element = rootRef.current
    if (!element) return
    const visible = visibleDimension(element)
    props.onWindowResize?.(visible.width, visible.height, props.top || 0, props.left || 0, _path)
  }, [width, height, props.floating])

  useValidateElement(rootRef, { $parent: { $match: '.pf-container,.pf-window-group' } }, (validation) => {
    if (!validation) {
      throw new Error('ResizableWindow must be used within a Container or another ResizableWindow.')
    }
  })

  const floatingHeaderRender = () => {
    if (!props.floating) return null
    return (
      <div ref={moveWindowRef} className="pf-floating-window_header">
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
        'pf-floating-window': props.floating
      })}
      style={style}
    >
      <div className="pf-resizable-window">
        {floatingHeaderRender()}
        <div ref={resizeRef} className="pf-resizable-window_resize-handle">
          <div className="pf-left-edge" />
          <div className="pf-right-edge" />
          <div className="pf-top-edge" />
          <div className="pf-bottom-edge" />
          <div className="pf-top-left-corner" />
          <div className="pf-top-right-corner" />
          <div className="pf-bottom-left-corner" />
          <div className="pf-bottom-right-corner" />
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
