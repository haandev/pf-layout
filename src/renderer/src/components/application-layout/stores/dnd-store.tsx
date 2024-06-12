import { RefObject } from 'react';
import { create } from 'zustand';

export interface DragSource {
  ref: React.RefObject<HTMLElement>;
  type: string;
  item: Record<string, any>;
}

export interface DroppableObject {
  accepts: string[];
  ref: RefObject<any>;
}

export interface DndStore {
  isDragging: boolean;
  dragging: (object: DragSource) => void;
  endDrag: () => void;
  dragSource: DragSource | null;
  draggableList: DragSource[];
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
