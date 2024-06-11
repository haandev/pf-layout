import { FC, useEffect, useRef, useCallback } from 'react'
import { Direction } from '../types'
import useDragDelta from '../hooks/use-drag-delta'
import useEvent from 'react-use-event-hook'

interface SplitResizeHandleProps {
  direction: Direction
  onResize?: (firstItemSize: number, lastItemSize: number) => void
}

export const SplitResizeHandle: FC<SplitResizeHandleProps> = ({ direction, onResize }) => {
  //const ref = useRef<HTMLDivElement>(null);

  const onDrag = useEvent((e, xDelta, yDelta) => {
    const element = ref.current
    if (!element || !element.parentElement || !element.parentElement.nextElementSibling) return

    const parentRect = element.parentElement.getBoundingClientRect()
    const neighborRect = element.parentElement.nextElementSibling.getBoundingClientRect()

    const delta = direction === Direction.Horizontal ? xDelta : yDelta
    const firstItemSize = (direction === Direction.Horizontal ? parentRect.width : parentRect.height) + delta
    const lastItemSize = (direction === Direction.Horizontal ? neighborRect.width : neighborRect.height) - delta
    onResize?.(firstItemSize, lastItemSize)
  })
  const ref = useDragDelta<HTMLDivElement>({ onDrag })

  return <div ref={ref} className="pf-split-resize-handle"></div>
}
