import React, { useCallback, useEffect, useRef } from 'react';
import useEvent from 'react-use-event-hook';
import { useClickAnyWhere } from 'usehooks-ts';
import { validateElement } from './use-validate-element';
import { DragSource, dndStore } from '../stores/dnd-store';

export type DragOptions<T extends HTMLElement> = {
  ref?: React.RefObject<T>;
  safetyMargins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  onDragStart?: (e: MouseEvent) => void;
  onDrag?: (e: MouseEvent, xDelta: number, yDelta: number) => void;
  onDragEnd?: (e: MouseEvent) => void;
};
export type UseDragDeltaOptions<T extends HTMLElement> = (DragSource<T> & DragOptions<T>) | DragOptions<T>;
export const isDragSource = <T extends HTMLElement>(options: UseDragDeltaOptions<T>): options is DragSource<T> => (options as DragSource<T>).type !== undefined;

export function useDragDelta<T extends HTMLElement>(options: UseDragDeltaOptions<T>) {
  const { safetyMargins, onDrag, onDragEnd, onDragStart, ...dragSourceOptions } = options;
  const internalRef = useRef<T>(null);
  const ref = options.ref || internalRef;
  isDragSource(options) && (dragSourceOptions.ref = ref);

  const dragging = dndStore((state) => state.dragging);
  const endDrag = dndStore((state) => state.endDrag);

  const initials = useRef({
    x: 0,
    y: 0,
    xDelta: 0,
    yDelta: 0,
    dragging: false,
    dragStartFired: false
  });

  useClickAnyWhere((e) => onMouseUp(e));

  const onMouseMove = useEvent((e) => {
    if (validateElement(e.target, { $ancestors: { $match: '.no-drag' } })) {
      e.stopPropagation();
      return;
    }
    const isSafeY = (safetyMargins?.top || 0) < e.clientY && e.clientY < window.innerHeight - (safetyMargins?.bottom || 0);
    const isSafeX = (safetyMargins?.left || 0) < e.clientX && e.clientX < window.innerWidth - (safetyMargins?.right || 0);
    const isSafe = isSafeX && isSafeY;
    if (!isSafe) return;
    !initials.current.dragStartFired && options.onDragStart?.(e);
    initials.current.dragStartFired = true;

    const xDelta = e.clientX - initials.current.x;
    const yDelta = e.clientY - initials.current.y;
    initials.current.xDelta = xDelta;
    initials.current.yDelta = yDelta;
    initials.current.x = e.clientX;
    initials.current.y = e.clientY;
    onDrag?.(e, initials.current.xDelta, initials.current.yDelta);
    isDragSource(dragSourceOptions) && dragging(dragSourceOptions);
  });

  const onMouseUp = useEvent((e) => {
    if (!initials.current.dragging) return;
    initials.current.dragging = false;
    initials.current.dragStartFired = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    onDragEnd?.(e);
    endDrag();
  });

  const handler = useCallback((e) => {
    if (validateElement(e.target, { $ancestors: { $match: '.no-drag' } })) {
      e.stopPropagation();
      return;
    }
    initials.current.dragging = true;

    initials.current.x = e.clientX;
    initials.current.y = e.clientY;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  useEffect(() => {
    ref.current?.addEventListener('mousedown', handler);
    return () => {
      ref.current?.removeEventListener('mousedown', handler);
    };
  }, []);

  return ref;
}
