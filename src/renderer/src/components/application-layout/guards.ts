import { IGroupView, ITab, ITabView, IToolbarStackGroup, IWindow, NodeType, StateItem } from './types';

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
export const isGroupView = (state: any): state is IGroupView => state && 'type' in state && state.type === NodeType.GroupView;

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
 * Type guard to check if the state object is a ToolbarStackGroup.
 * @param state The state object to check.
 * @returns true if the state is a ToolbarStackGroup, false otherwise.
 */
export const isToolbarStackGroup = (state: any): state is IToolbarStackGroup => state && 'type' in state && state.type === NodeType.ToolbarStackGroup;
