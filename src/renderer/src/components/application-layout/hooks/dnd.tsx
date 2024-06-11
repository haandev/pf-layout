import { RefObject } from "react";

export interface DraggableObject {
  type: string,
  ref: RefObject<any>,
}

export interface DroppableObject {
  accepts: string[],
  ref: RefObject<any>,
}

export interface DndStore {
  isDragging: boolean,
  nowDragging: RefObject<any>[],
  draggable: DraggableObject[],
  droppable: DroppableObject[],
}
