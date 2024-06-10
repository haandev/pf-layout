import { useCallback, useRef, useState } from 'react'

// Define types for the callbacks and the options parameter
type UseLongPressOptions = {
  shouldPreventDefault?: boolean
  delay?: number
}

const useLongPress = (
  onLongPress: (event: MouseEvent | TouchEvent) => void,
  onClick: (event?: MouseEvent | TouchEvent) => void,
  { shouldPreventDefault = true, delay = 300 }: UseLongPressOptions = {}
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false)
  const timeout = useRef<NodeJS.Timeout>()
  const target = useRef<EventTarget | null>(null)

  const start = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (shouldPreventDefault && event.target) {
        ;(event.target as EventTarget).addEventListener('touchend', preventDefault, {
          passive: false
        })
        target.current = event.target
      }
      timeout.current = setTimeout(() => {
        !longPressTriggered && onLongPress(event)
        setLongPressTriggered(true)
      }, delay)
    },
    [onLongPress, delay, shouldPreventDefault]
  )

  const clear = useCallback(
    (event: MouseEvent | TouchEvent, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current)
      shouldTriggerClick && !longPressTriggered && onClick(event)
      setLongPressTriggered(false)
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener('touchend', preventDefault)
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  )

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: (e: MouseEvent) => clear(e, false),
    onTouchEnd: clear
  }
}

const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => {
  return 'touches' in event
}

const preventDefault = (event: any) => {
  if (!isTouchEvent(event)) return
  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault()
  }
}

export default useLongPress
