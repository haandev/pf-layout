import React, { useCallback, useMemo } from 'react'
import { useDragDelta } from '..'

export type UseBoxResizeHandler = (e: MouseEvent, width: number, height: number, top: number, left: number) => void
export function useBoxResize<T extends HTMLElement>(options: {
  ref: React.RefObject<HTMLElement>
  safetyMargins?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  handler: UseBoxResizeHandler
}) {
  const resizeHandler = useCallback(
    (
      e: MouseEvent,
      handle: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
      xDelta: number,
      yDelta: number
    ) => {
      console.log('resizeHandler', handle, xDelta, yDelta)
      if (!options.ref.current) return
      const initialRect = options.ref.current.getBoundingClientRect()
      console.log(initialRect)
      switch (handle) {
        case 'left':
          options.handler(e, initialRect.width - xDelta, initialRect.height, initialRect.top, initialRect.left + xDelta)
          break
        case 'right':
          options.handler?.(e, initialRect.width + xDelta, initialRect.height, initialRect.top, initialRect.left)
          break
        case 'top':
          options.handler?.(e, initialRect.width, initialRect.height - yDelta, initialRect.top + yDelta, initialRect.left)
          break
        case 'bottom':
          options.handler(e, initialRect.width, initialRect.height + yDelta, initialRect.top, initialRect.left)
          break
        case 'top-left':
          options.handler(e, initialRect.width - xDelta, initialRect.height - yDelta, initialRect.top + yDelta, initialRect.left + xDelta)
          break
        case 'top-right':
          options.handler(e, initialRect.width + xDelta, initialRect.height - yDelta, initialRect.top + yDelta, initialRect.left)
          break
        case 'bottom-left':
          options.handler(e, initialRect.width - xDelta, initialRect.height + yDelta, initialRect.top, initialRect.left + xDelta)
          break
        case 'bottom-right':
          options.handler(e, initialRect.width + xDelta, initialRect.height + yDelta, initialRect.top, initialRect.left)
          break
      }
    },
    []
  )

  const left = useDragDelta<HTMLDivElement>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'left', xDelta, yDelta)
    },
    safetyMargins: options.safetyMargins
  })
  const right = useDragDelta<T>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'right', xDelta, yDelta)
    },
    safetyMargins: options.safetyMargins
  })
  const top = useDragDelta<T>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'top', xDelta, yDelta)
    },
    safetyMargins: options.safetyMargins
  })
  const bottom = useDragDelta<T>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'bottom', xDelta, yDelta)
    },
    safetyMargins: options.safetyMargins
  })
  const topLeft = useDragDelta<T>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'top-left', xDelta, yDelta)
    },
    safetyMargins: options.safetyMargins
  })
  const topRight = useDragDelta<T>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'top-right', xDelta, yDelta)
    },
    safetyMargins: options.safetyMargins
  })
  const bottomLeft = useDragDelta<T>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'bottom-left', xDelta, yDelta)
    },
    safetyMargins: options.safetyMargins
  })
  const bottomRight = useDragDelta<T>({
    onDrag: (e, xDelta, yDelta) => {
      resizeHandler(e, 'bottom-right', xDelta, yDelta)
    },
    safetyMargins: options.safetyMargins
  })
  return useMemo(
    () => ({
      left,
      right,
      top,
      bottom,
      topLeft,
      topRight,
      bottomLeft,
      bottomRight
    }),
    []
  )
}
