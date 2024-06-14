import { useEffect, useRef } from 'react';

import useEvent from 'react-use-event-hook';

export type UseDropDeltaOptions = {
  accepts: string[];
  ref?: React.RefObject<HTMLElement>;
  onDrop?: (e: MouseEvent) => void;
  onDragOver?: (e: MouseEvent) => void;
};
export function useDropDelta<T extends HTMLElement>(options: UseDropDeltaOptions) {
  const internalRef = useRef<T>(null);
  const ref = options.ref || internalRef;

  const mouseUpHandler = useEvent((e: MouseEvent) => {
    document.removeEventListener('mouseup', mouseUpHandler);
    document.removeEventListener('mousemove', dragOverHandler);

    if (!ref.current) return;
    if (!isMouseOver(e, ref.current)) return;

    options.onDrop?.(e);
  });

  const dragOverHandler = useEvent((e: MouseEvent) => {
    if (!ref.current) return;
    if (!isMouseOver(e, ref.current)) return;

    options.onDragOver?.(e);
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
  }, []);
}
const isMouseOver = (e: MouseEvent, ref: HTMLElement) => {
  const rect = ref.getBoundingClientRect();
  return rect.left < e.clientX && e.clientX < rect.right && rect.top < e.clientY && e.clientY < rect.bottom;
};
