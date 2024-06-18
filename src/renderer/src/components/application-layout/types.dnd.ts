import { Direction, NodeType } from './types';

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
export interface ToolbarWindowDragSource {
  type: NodeType.ToolbarWindow;
  id: string;
}
export interface StackDragSource {
  type: NodeType.Stack;
  id: string;
  x: number;
  y: number;
}
export interface ToolbarDragSource {
  type: NodeType.Toolbar;
  id: string;
  direction: Direction;
}

export interface LayoutDropTarget {}

//droppable items
export type TabViewDroppableItems = TabViewDragSource | TabDragSource;
export type SceneDroppableItems = TabViewDragSource | TabDragSource | WindowDragSource;
export type TabDroppableItems = TabDragSource;
export type LayoutDroppableItems = ToolbarWindowDragSource | StackDragSource;
