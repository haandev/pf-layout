import React, { useCallback, useEffect, useRef } from 'react'

export interface RefOrRefTakingFunction<T> {
  (ref: React.RefObject<T>): void
  current?: T | null
}
const useDragDelta = (options: {
  ref?: React.RefObject<HTMLElement>
  onDragStart?: (e: MouseEvent) => void
  onDragEnd?: (e: MouseEvent, xDelta: number, yDelta: number) => void
}) => {
  const internalRef = useRef<HTMLElement>(null)
  const ref = options.ref || internalRef

  const initials = useRef({
    x: 0,
    y: 0,
    xDelta: 0,
    yDelta: 0,
    dragging: false
  })

  const handler = useCallback((e) => {
    const onDragStart = options.onDragStart
    const onDragEnd = options.onDragEnd
    initials.current.x = e.clientX
    initials.current.y = e.clientY

    const onMouseMove = (e: MouseEvent) => {
      initials.current.dragging = true
      const xDelta = e.clientX - initials.current.x
      const yDelta = e.clientY - initials.current.y
      initials.current.xDelta = xDelta
      initials.current.yDelta = yDelta
      initials.current.x = e.clientX
      initials.current.y = e.clientY
    }

    const onMouseUp = (e: MouseEvent) => {
      if (!initials.current.dragging) return
      initials.current.dragging = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      onDragEnd?.(e, initials.current.xDelta, initials.current.yDelta)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    onDragStart?.(new MouseEvent('mousedown'))
  }, [])

  useEffect(() => {
    ref.current?.addEventListener('mousedown', handler)
    return () => {
      ref.current?.removeEventListener('mousedown', handler)
    }
  }, [])

  return { ref }
}

export default useDragDelta
