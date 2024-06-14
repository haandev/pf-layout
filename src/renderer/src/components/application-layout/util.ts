import { IScene, IGroupView, ITab, ITabView, IWindow, NestedState, NodeType, ParentType, StateItem } from './types';

/**
 * Checks if a given value is empty. An empty value can be false, null, undefined, an empty array, or an empty object.
 * @param value The value to check.
 * @returns true if the value is considered empty, false otherwise.
 */
export const isEmpty = (value: unknown) => {
  return value === false || value === null || value === undefined || (Array.isArray(value) && value.length === 0) || Object.keys(value).length === 0;
};

/**
 * Evaluates a boolean value or the result of a function that returns a boolean.
 * If the input is a function, the function is called with the provided parameters, and its result is converted to boolean.
 * If the input is a boolean, it returns the value directly.
 * Returns false if the input is undefined or null, and true for all other non-boolean, non-function values.
 *
 * @param funcOrTag A boolean value, a function, or undefined/null.
 * @param params Parameters to pass to the function if funcOrBool is a function.
 * @returns The boolean result.
 */
export const evalBoolean = <T extends (...params: any[]) => boolean | any>(
  funcOrBool: T | boolean | undefined | null,
  ...params: T extends boolean ? never : Parameters<T>
): boolean => {
  if (funcOrBool === undefined || funcOrBool === null) {
    return false;
  } else if (typeof funcOrBool === 'boolean') {
    return funcOrBool;
  } else if (typeof funcOrBool === 'function') {
    return Boolean(funcOrBool(...params));
  } else {
    return true;
  }
};

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

type LookupResult<T> = { item: T | null; parent: ParentType<T> | null; index: number; depth: number };

/**
 * Looks up an item by id in a nested state structure.
 * @param state The state to traverse.
 * @param id The id of the item to look for.
 * @param depth Current depth of the search.
 * @returns LookupResult containing the item, its parent, and index in parent, or nulls if not found.
 */
export const lookUp = <T extends StateItem>(state: NestedState | NestedState[], id?: string, depth: number = 0): LookupResult<T> => {
  if (depth > 100) {
    throw new Error('Max depth reached');
  }
  if (!id) {
    return { item: null, parent: null, index: -1, depth };
  }
  if (Array.isArray(state)) {
    state = { members: state } as NestedState;
  }
  if ('id' in state && state.id === id) {
    return { item: state, parent: null, index: -1, depth } as LookupResult<T>;
  }
  if ('members' in state && state.members) {
    for (let i = 0; i < state.members.length; i++) {
      if (state.members[i].id === id) {
        return { item: state.members[i], parent: state, index: i, depth: depth + 1 } as LookupResult<T>;
      }
      let result = lookUp(state.members[i], id, depth + 1);
      if (result.item) {
        return result as LookupResult<T>;
      }
    }
  }
  return { item: null, parent: null, index: -1 } as LookupResult<T>;
}; //TODO: implement with traverse function

type Traversable<T extends string> = { [key in T]?: Traversable<T>[] } & { [key: string]: any };

/**
 * Traverses a nested state structure, performing an action at each node.
 * @param state The state to traverse.
 * @param key The key to look for children nodes.
 * @param func The function to execute at each node.
 * @returns true if the function returns true at any node, false otherwise.
 */
export const traverse = <F extends (...params: any[]) => any, T extends string>(state: Traversable<T>, key: T, func: F): any => {
  if (func(state)) {
    return true;
  }
  if (key in state && Array.isArray(state[key])) {
    state[key].some((child: Traversable<T>) => traverse(child, key, func));
  }
  return false;
};

const cleanObject = (obj: NestedState, depth = 0): boolean => {
  if (depth > 100) {
    throw new Error('Max depth reached');
  }
  let somethingRemoved = false;
  if (!('members' in obj)) return false;
  const arr = obj.members;
  arr.forEach((value: NestedState | null, index: number) => {
    if (value === null) {
      arr.splice(index, 1);
      somethingRemoved = true;
    } else if (typeof value === 'object' && value !== null) {
      if ('members' in value && isEmpty(value.members)) {
        arr.splice(index, 1);
        somethingRemoved = true;
      } else if (
        'type' in value &&
        value.type === NodeType.GroupView &&
        'members' in value &&
        value.members &&
        value.members.length === 1 &&
        value.members[0].type === NodeType.GroupView
      ) {
        Object.assign(value, value.members[0]);
        somethingRemoved = true;
      } else {
        if (cleanObject(value, ++depth)) {
          somethingRemoved = true;
        }
      }
    }
  });

  return somethingRemoved;
};

/**
 * Cleans up the state, removing empty objects and arrays.
 * @param state - An object with a `members` array representing the current state.
 * @returns An object containing the cleaned list of members and a boolean indicating if the home condition is met.
 */
export const cleanUp = (state: { members: IWindow[] }) => {
  do {} while (cleanObject(state));
  let newWindows = state.members.filter(Boolean);

  return { members: newWindows, home: newWindows.length === 0 };
};

/**
 * Updates the sizes of the members in the given state object according to the provided width and height changes.
 * @param win - The state object containing members to update.
 * @param widthChange - The multiplier for the width update.
 * @param heightChange - The multiplier for the height update.
 */
export const updateSizes = (win: NestedState, widthChange: number, heightChange: number) => {
  traverse(win, 'members', (item) => {
    if ('height' in item && 'width' in item) {
      item.width = item.width ? item.width * widthChange : undefined;
      item.height = item.height ? item.height * heightChange : undefined;
    }
    return false;
  });
};

/**
 * Calculates the next unused "Untitled" number in the state's members titles.
 * @param state - The state object to search for titles.
 * @returns The next available number to be used in an "Untitled" title.
 */
export const nextUntitledCount = (state: NestedState) => {
  const titles: string[] = [];
  traverse(state, 'members', (item) => {
    if (isTab(item) && item.title.startsWith('Untitled')) {
      titles.push(item.title);
    }
  });

  const untitledNumbers = titles.map((title) => {
    const match = title.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  });

  let nextNumber = 1;
  untitledNumbers
    .sort((a, b) => a - b)
    .forEach((number) => {
      if (number === nextNumber) {
        nextNumber++;
      }
    });

  return nextNumber;
};

/**
 * Determines the next highest `zIndex` value for a new window in the state.
 * @param state - The application state containing members with `zIndex` values.
 * @returns The next highest `zIndex` value.
 */
export const nextZIndex = (state: IScene) => {
  return Math.max(...state.members.map((window) => window.zIndex || 0)) + 1;
};