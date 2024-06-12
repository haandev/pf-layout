import { useEffect, useRef } from 'react';

import useEvent from 'react-use-event-hook';
import { DragSource, dndStore } from '../stores/dnd-store';

export type UseDropDeltaOptions = {
  accepts: string[];
  ref?: React.RefObject<HTMLElement>;
  onDrop?: (e: MouseEvent, dragSource: DragSource) => void;
  onDragOver?: (e: MouseEvent, dragSource: DragSource) => void;
};
export function useDropDelta<T extends HTMLElement>(options: UseDropDeltaOptions) {
  const internalRef = useRef<T>(null);
  const ref = options.ref || internalRef;
  const dragSource = dndStore((state) => state.dragSource?.type && options.accepts.includes(state.dragSource?.type) && state.dragSource);

  const mouseUpHandler = useEvent((e: MouseEvent) => {
    document.removeEventListener('mouseup', mouseUpHandler);
    document.removeEventListener('mousemove', dragOverHandler);

    if (!ref.current) return;
    if (!dragSource) return;
    if (dragSource.ref.current === ref.current) return;
    if (!isMouseOver(e, ref.current)) return;

    options.onDrop?.(e, dragSource);
  });

  const dragOverHandler = useEvent((e: MouseEvent) => {
    if (!dragSource) return;
    if (dragSource.ref.current === ref.current) return;
    if (!ref.current) return;
    if (!isMouseOver(e, ref.current)) return;

    options.onDragOver?.(e, dragSource);
  });

  const mouseDownHandler = useEvent((e: MouseEvent) => {
    document.addEventListener('mouseup', mouseUpHandler);
    document.addEventListener('mousemove', dragOverHandler);
  });

  useEffect(() => {
    if (!ref.current) return;
    document.addEventListener('mousedown', mouseDownHandler);
    return () => {
      document.removeEventListener('mousedown', mouseDownHandler);
    };
  }, [dragSource]);
}
const isMouseOver = (e: MouseEvent, ref: HTMLElement) => {
  const rect = ref.getBoundingClientRect();
  return rect.left < e.clientX && e.clientX < rect.right && rect.top < e.clientY && e.clientY < rect.bottom;
};
