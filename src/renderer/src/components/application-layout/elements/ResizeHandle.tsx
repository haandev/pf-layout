import { FC, useEffect, useRef } from 'react'
import { Direction } from '../types'

export interface ResizeHandleProps {
  direction: Direction
  onResize?: (firstItemSize: number, lastItemSize:number) => void
}

export const ResizeHandle: FC<ResizeHandleProps> = ({ direction, onResize }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const handler = (e: MouseEvent) => {
      const initialSize = (direction === Direction.Horizontal ? ref.current?.offsetLeft : ref.current?.offsetTop) || 0
      const parent = ref.current?.parentElement
      const neighbor = parent?.nextElementSibling?.getBoundingClientRect()
      const neighborSize = direction === Direction.Horizontal ? neighbor?.width : neighbor?.height

      const parentOffset = (direction === Direction.Horizontal ? parent?.getBoundingClientRect().x : parent?.getBoundingClientRect().y) || 0
      console.log('initialSize', initialSize)
      console.log('parentOffset', parent, parentOffset, direction)

      const onMouseMove = (e: MouseEvent) => {
        const delta = (direction === Direction.Horizontal ? e.clientX : e.clientY) - initialSize - parentOffset
        const lastItemSize = neighborSize ? neighborSize - delta : 0
        onResize?.(initialSize + delta, lastItemSize)
      }
      const onMouseUp = () => {
        if (!ref.current) return
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }

    ref.current?.addEventListener('mousedown', handler)
    return () => {
      ref.current?.removeEventListener('mousedown', handler)
    }
  }, [ref.current])
  return <div ref={ref} className="pf-resize-handle"></div>
}
