import {
  IContainer,
  IGroupView,
  ITab,
  ITabView,
  IToolbar,
  IStack,
  IToolbarWindow,
  IWindow,
  NodeType,
  StateItem
} from './types';

/**
 * Type guard to check if the state object is a Window.
 * @param state The state object to check.
 * @returns true if the state is a Window, false otherwise.
 */
export const isWindow = (state: any): state is IWindow => state && 'type' in state && state.type === NodeType.Window;

/**
 * Type guard to check if the state object is a GroupView.
 * @param state The state object to check.
 * @returns true if the state is a GroupView, false otherwise.
 */
export const isGroupView = (state: any): state is IGroupView =>
  state && 'type' in state && state.type === NodeType.GroupView;

/**
 * Type guard to check if the state object is a TabView.
 * @param state The state object to check.
 * @returns true if the state is a TabView, false otherwise.
 */
export const isTabView = (state: any): state is ITabView => state && 'type' in state && state.type === NodeType.TabView;

/**
 * Type guard to check if the state object is a Tab.
 * @param state The state object to check.
 * @returns true if the state is a Tab, false otherwise.
 */
export const isTab = (state: any): state is ITab => state && 'type' in state && state.type === NodeType.Tab;

/**
 * Checks if the state object has members array.
 * @param state The state object to check.
 * @returns true if the state has a members array, false otherwise.
 */
export const hasMembers = (state: any): state is { members: StateItem[] } & { [key: string]: any } =>
  state && 'members' in state && Array.isArray(state.members);

/**
 * Type guard to check if the state object is a ToolbarWindow.
 * @param state The state object to check.
 * @returns true if the state is a ToolbarWindow, false otherwise.
 */
export const isToolbarWindow = (state: any): state is IToolbarWindow =>
  state && 'type' in state && state.type === NodeType.ToolbarWindow;

/**
 * Type guard to check if the state object is a Container.
 * @param state The state object to check.
 * @returns true if the state is a Container, false otherwise.
 */
export const isContainer = (state: any): state is IContainer =>
  state && 'type' in state && state.type === NodeType.Container;

/**
 * Type guard to check if the state object is a Stack.
 * @param state The state object to check.
 * @returns true if the state is a Stack, false otherwise.
 */
export const isStack = (state: any): state is IStack =>
  state && 'type' in state && state.type === NodeType.Stack;

/**
 * Type guard to check if the state object is a Toolbar.
 * @param state The state object to check.
 * @returns true if the state is a Toolbar, false otherwise.
 */
export const isToolbar = (state: any): state is IToolbar => state && 'type' in state && state.type === NodeType.Toolbar;

export const isString = (value: any): value is string => typeof value === 'string';
