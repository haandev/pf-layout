import React, { useCallback, useEffect, useRef } from 'react'
import { useClickAnyWhere } from 'usehooks-ts'

export interface RefOrRefTakingFunction<T> {
  (ref: React.MutableRefObject<T>): void
  current?: T | null
}

function useDragDelta<T extends HTMLElement>(options: {
  ref?: React.RefObject<T>
  onDragStart?: (e: MouseEvent) => void
  onDrag?: (e: MouseEvent, xDelta: number, yDelta: number) => void
  onDragEnd?: (e: MouseEvent) => void
}) {
  const internalRef = useRef<T>(null)
  const ref = options.ref || internalRef
  const mouseUpFunction = useRef<any>({})
  useClickAnyWhere((e) => {
    if (typeof mouseUpFunction.current === 'function') mouseUpFunction.current(e)
  })

  const initials = useRef({
    x: 0,
    y: 0,
    xDelta: 0,
    yDelta: 0,
    dragging: false
  })

  const handler = useCallback((e) => {
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
      options.onDrag?.(e, initials.current.xDelta, initials.current.yDelta)
    }
    const onMouseUp = (e: MouseEvent) => {
      if (!initials.current.dragging) return
      initials.current.dragging = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      options.onDragEnd?.(e)
    }

    mouseUpFunction.current = onMouseUp
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
