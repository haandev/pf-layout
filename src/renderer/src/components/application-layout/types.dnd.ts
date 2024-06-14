import { NodeType } from './types';

//drag sources

export interface WindowDragSource {
  type: NodeType.Window;
  id: string;
}
export interface TabDragSource {
  type: NodeType.Tab;
  id: string;
  prevTabId?: string;
  tabViewId: string;
}

export type TabViewDragSource = {
  type: NodeType.TabView;
  id: string;
  x: number;
  y: number;
};

export type TabViewDropTarget = {
  isInsertable?: boolean;
  isDroppable?: boolean;
};

//drop targets
export type TabDropTarget = {
  isInserting: boolean;
};
export interface SceneDropTarget {
  isDroppable: boolean;
}

//droppable items
export type TabViewDroppableItems = TabViewDragSource | TabDragSource;
export type SceneDroppableItems = TabViewDragSource | TabDragSource | WindowDragSource;
export type TabDroppableItems = TabDragSource;
