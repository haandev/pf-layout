import { FC, useEffect, useRef, useCallback } from 'react';
import { Direction } from '../types';

interface SplitResizeHandleProps {
  direction: Direction;
  onResize?: (firstItemSize: number, lastItemSize: number) => void;
}

export const SplitResizeHandle: FC<SplitResizeHandleProps> = ({ direction, onResize }) => {
  const ref = useRef<HTMLDivElement>(null);

  const resizeHandler = useCallback((e: MouseEvent) => {
    const element = ref.current;
    if (!element || !element.parentElement || !element.parentElement.nextElementSibling) return;

    const initialPos = direction === Direction.Horizontal ? e.clientX : e.clientY;
    const parentRect = element.parentElement.getBoundingClientRect();
    const neighborRect = element.parentElement.nextElementSibling.getBoundingClientRect();

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = direction === Direction.Horizontal ? moveEvent.clientX : moveEvent.clientY;
      const delta = currentPos - initialPos;
      const firstItemSize = (direction === Direction.Horizontal ? parentRect.width : parentRect.height) + delta;
      const lastItemSize = (direction === Direction.Horizontal ? neighborRect.width : neighborRect.height) - delta;
      onResize?.(firstItemSize, lastItemSize);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [direction, onResize]);

  useEffect(() => {
    const element = ref.current;
    element?.addEventListener('mousedown', resizeHandler);
    return () => {
      element?.removeEventListener('mousedown', resizeHandler);
    };
  }, [resizeHandler]);

  return <div ref={ref} className="pf-split-resize-handle"></div>;
};
