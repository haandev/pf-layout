import { RefObject } from 'react';
import { create } from 'zustand';

export interface DragSource<T extends HTMLElement> {
  ref: React.RefObject<T>;
  type: string;
  item: Record<string, any>;
}

export interface DroppableObject {
  accepts: string[];
  ref: RefObject<any>;
}

export interface DndStore {
  isDragging: boolean;
  dragging: (object: DragSource<HTMLElement>) => void;
  endDrag: () => void;
  dragSource: DragSource<HTMLElement> | null;
  draggableList: DragSource<HTMLElement>[];
}

export const dndStore = create<DndStore>((set) => ({
  isDragging: false,
  dragging: (options) =>
    set((state) => {
      state.dragSource = options;
      return state;
    }),
  endDrag: () => {
    requestAnimationFrame(() => set({ isDragging: false, dragSource: null }));
  },
  dragSource: null,
  draggableList: [],
  droppableList: []
}));
