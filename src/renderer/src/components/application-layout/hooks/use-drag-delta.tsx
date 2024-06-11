import React, { useCallback, useEffect, useRef } from 'react'
import useEvent from 'react-use-event-hook'
import { useClickAnyWhere } from 'usehooks-ts'

export interface RefOrRefTakingFunction<T> {
  (ref: React.MutableRefObject<T>): void
  current?: T | null
}

function useDragDelta<T extends HTMLElement>(options: {
  ref?: React.RefObject<T>
  safetyMargins?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  onDragStart?: (e: MouseEvent) => void
  onDrag?: (e: MouseEvent, xDelta: number, yDelta: number) => void
  onDragEnd?: (e: MouseEvent) => void
}) {
  const internalRef = useRef<T>(null)
  const ref = options.ref || internalRef

  const initials = useRef({
    x: 0,
    y: 0,
    xDelta: 0,
    yDelta: 0,
    dragging: false
  })
  useClickAnyWhere((e) => onMouseUp(e))

  const onMouseMove = useEvent((e) => {
    const isSafeY = (options.safetyMargins?.top || 0) < e.clientY && e.clientY < window.innerHeight - (options.safetyMargins?.bottom || 0)
    const isSafeX = (options.safetyMargins?.left || 0) < e.clientX && e.clientX < window.innerWidth - (options.safetyMargins?.right || 0)
    const isSafe = isSafeX && isSafeY
    if (!isSafe) return

    initials.current.dragging = true
    const xDelta = e.clientX - initials.current.x
    const yDelta = e.clientY - initials.current.y
    initials.current.xDelta = xDelta
    initials.current.yDelta = yDelta
    initials.current.x = e.clientX
    initials.current.y = e.clientY
    options.onDrag?.(e, initials.current.xDelta, initials.current.yDelta)
  })

  const onMouseUp = useEvent((e) => {
    if (!initials.current.dragging) return
    initials.current.dragging = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    options.onDragEnd?.(e)
  })

  const handler = useCallback((e) => {
    initials.current.x = e.clientX
    initials.current.y = e.clientY

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    options.onDragStart?.(new MouseEvent('mousedown'))
  }, [])

  useEffect(() => {
    ref.current?.addEventListener('mousedown', handler)
    return () => {
      ref.current?.removeEventListener('mousedown', handler)
    }
  }, [])

  return ref
}

export default useDragDelta
