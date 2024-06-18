import { isTab } from './guards';
import { Direction, IScene, IWindow, NestedState, NodeType, ParentType, StateItem } from './types';

/**
 * Checks if a given value is empty. An empty value can be false, null, undefined, an empty array, or an empty object.
 * @param value The value to check.
 * @returns true if the value is considered empty, false otherwise.
 */
export const isEmpty = (value: unknown) => {
  return (
    value === false ||
    value === null ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0) ||
    Object.keys(value).length === 0
  );
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

export type LookupResult<T> = { item: T | null; parent: ParentType<T> | null; index: number; depth: number };

/**
 * Looks up an item by id in a nested state structure.
 * @param state The state to traverse.
 * @param id The id of the item to look for.
 * @param depth Current depth of the search.
 * @returns LookupResult containing the item, its parent, and index in parent, or nulls if not found.
 */
export const lookUp = <T extends StateItem>(
  state: NestedState | NestedState[],
  id: string | undefined,
  depth: number = 0
): LookupResult<T> => {
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
  if ('members' in state && state['members'] && Array.isArray(state['members'])) {
    for (let i = 0; i < state['members'].length; i++) {
      if (state['members'][i].id === id) {
        return { item: state['members'][i], parent: state, index: i, depth: depth + 1 } as LookupResult<T>;
      }
      let result = lookUp(state['members'][i], id, depth + 1);
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
export const traverse = <F extends (...params: any[]) => any, T extends string>(
  state: Traversable<T>,
  key: T,
  func: F
): any => {
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
        value.members[0].type === NodeType.GroupView &&
        depth > 1
      ) {
        Object.assign(value, value.members[0]);
        somethingRemoved = true;
      } else if (
        // causing unexpected behavior, TODO: further investigate
        'type' in value &&
        value.type === NodeType.GroupView &&
        'members' in value &&
        value.members.length === 1 &&
        value.members[0].type === NodeType.TabView &&
        depth > 3
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
export const nextZIndex = (state: IScene | Array<any>) => {
  if (Array.isArray(state)) state = { members: state };
  return Math.max(...state.members.map((window) => window.zIndex || 0)) + 1;
};

/**
 * Generates random coordinates for a new Window or ToolbarWindow.
 * @returns An object containing the x and y coordinates.
 */
export const generateRandomCoordinates = () => {
  const minX = 100;
  const minY = 100;
  const maxX = window.innerWidth - 200;
  const maxY = window.innerHeight - 200;

  const x = Math.random() * (maxX - minX) + minX;
  const y = Math.random() * (maxY - minY) + minY;

  return { x: Math.floor(x), y: Math.floor(y) };
};

/**
 * Prevents dragging of an element.
 * Usage example: `<div {...(!props.draggable ? noDrag : {})}>`
 */
export const noDrag = { draggable: true, onDragStart: (event: any) => event.preventDefault() };

/**
 * Remaps the `zIndex` values of the windows in the state to be sequential.
 * @param state - The state object containing members with `zIndex` values.
 * @returns An object containing the updated members array.
 */
export const remapZIndex = (state: IScene) => {
  state.members.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  state.members.forEach((window, index) => {
    window.zIndex = index + 1;
  });
  return { members: state.members };
};

/**
 * Determines the direction opposite to the provided direction.
 * @param direction - The direction to find the opposite of.
 */
export const opposite = (direction: Direction) => {
  return direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
};

/**
 * Gives screen margins for a given DOMRect.
 */ export interface DOMMarginsBox {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  leftMargin: number;
  rightMargin: number;
  bottomMargin: number;
  topMargin: number;
  x: number;
  y: number;
  leftSideOfScreen: boolean;
  rightSideOfScreen: boolean;
  horizontallyCentered: boolean;
  verticallyCentered: boolean;
  topSideOfScreen: boolean;
  bottomSideOfScreen: boolean;
  toJSON(): Record<string, any>;
}

export const getMargins = (element?: HTMLElement): DOMMarginsBox | undefined => {
  if (!element) return undefined;

  const rect = element.getBoundingClientRect();

  const margins: DOMMarginsBox = {
    get left(){
      return rect.left;
    },
    get right(){
      return rect.right;
    },
    get top(){
      return rect.top;
    },
    get bottom(){
      return rect.bottom;
    },
    get width(){
      return rect.width;
    },
    get height(){
      return rect.height;
    },
    get x(){
      return rect.x;
    },
    get y(){
      return rect.y;
    },
    get topMargin() {
      return rect.top;
    },
    get leftMargin() {
      return rect.left;
    },
    get rightMargin() {
      const clientWidth = document.documentElement.clientWidth;
      return clientWidth - rect.right;
    },
    get bottomMargin() {
      const clientHeight = document.documentElement.clientHeight;
      return clientHeight - rect.bottom;
    },
    get leftSideOfScreen() {
      const clientWidth = document.documentElement.clientWidth;
      return rect.left < clientWidth - rect.right;
    },
    get rightSideOfScreen() {
      const clientWidth = document.documentElement.clientWidth;
      return rect.left > clientWidth - rect.right;
    },
    get horizontallyCentered() {
      const clientWidth = document.documentElement.clientWidth;
      return rect.left === clientWidth - rect.right;
    },
    get verticallyCentered() {
      const clientHeight = document.documentElement.clientHeight;
      return rect.top === clientHeight - rect.bottom;
    },
    get topSideOfScreen() {
      const clientHeight = document.documentElement.clientHeight;
      return rect.top < clientHeight - rect.bottom;
    },
    get bottomSideOfScreen() {
      const clientHeight = document.documentElement.clientHeight;
      return rect.top > clientHeight - rect.bottom;
    },
    toJSON() {
      const { toJSON, ...json } = this;
      return json;
    }
  };

  return margins;
};
