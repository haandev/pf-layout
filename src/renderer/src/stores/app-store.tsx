import { create } from 'zustand';
import { ReactFlowInstance } from 'reactflow';
import { Direction } from '@renderer/components/application-layout/types';
import { v4 } from 'uuid';
import { findById, findIndexById, isEmpty, toRemovedById } from '@renderer/components/application-layout/util';

export enum NodeType {
  App = 'App',
  Tab = 'Tab',
  TabView = 'TabView',
  GroupView = 'GroupView',
  Window = 'Window'
}
export interface ITab {
  type: NodeType.Tab;
  id: string;
  title: string;
  content: React.ReactNode;
  recentlyCreated: boolean;
}
export interface ITabView {
  type: NodeType.TabView;
  id: string;
  members: ITab[];
  activeTabId?: string;
  width?: number;
  height?: number;
}
export interface IGroupView {
  type: NodeType.GroupView;
  id: string;
  members: (IGroupView | ITabView)[];
  width?: number;
  height?: number;
}
export type IWindow = {
  type: NodeType.Window;
  id: string;
  members: IGroupView[];
  floating?: boolean;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  minimized?: boolean;
  maximized?: boolean;
  previousPosition?: { top: number; left: number; width?: number; height?: number };
  zIndex?: number;
};
export type StateItem = ITab | ITabView | IGroupView | IWindow;
export type NestedState = StateItem | { members: IWindow[] };

type ParentType<T> = T extends ITab
  ? ITabView
  : T extends ITabView
    ? IGroupView
    : T extends IGroupView
      ? IWindow | IGroupView
      : T extends IWindow
        ? AppStore
        : null;

export interface AppStore {
  //home state and actions
  home?: boolean;
  showHome: () => void;
  hideHome: () => void;

  //layout state
  members: IWindow[];

  //window actions
  resizeWindow: (width: number, height: number, top: number, left: number, id: string) => void;
  maximizeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  addWindow: (window: Omit<IWindow, 'id'>) => void;
  closeWindow: (id: string) => void;
  restoreWindowSize: (id: string) => void;

  //view actions
  attachView: (id: string) => void;
  detachView: (id: string) => void;
  splitView: (id: string, direction: Direction) => void;
  resizeView: (direction: Direction, size: number, id: string, nextItemSize?: number) => void;

  //tab actions
  addTabInitial: (tab: Omit<ITab, 'type' | 'id' | 'title'> & { id?: string; title?: string }) => void;
  addTab: (id: string, tab: Omit<ITab, 'type' | 'id' | 'title'> & { id?: string; title?: string }) => void;
  changeTab: (id: string) => void;
  closeTab: (id: string) => void;
  moveTab: (options: { tabId: string; toViewId: string; beforeTabId?: string }) => void;

  //toolbar state
  tool: string;
  toolbarColSize: number;

  //toolbar actions
  setTool: (tool: string) => void;
  setToolbarColSize: (size: number) => void;

  //app state TODO: move to separate store
  flow?: ReactFlowInstance;

  //app actions
  setFlow: (flow: ReactFlowInstance) => void;
}
let detachOffset = 0;
let zIndexOffset = 0;

export const useApp = create<AppStore>((set) => ({
  home: true,
  showHome: () => set({ home: true }),
  hideHome: () => set({ home: false }),

  members: [],
  resizeWindow: (width, height, top, left, id) => {
    set((state) => {
      const members = [...state.members];
      const { item, parent } = getItemById<IWindow>(state, id);
      if (!isWindow(item) || !hasMembers(parent)) return { members };

      const zIndex = Math.max(...parent.members.map((window) => window.zIndex || 0)) + 1;
      const widthChange = item.width ? width / item.width : 1;
      const heightChange = item.height ? height / item.height : 1;
      updateSizes(item, widthChange, heightChange);

      Object.assign(item, {
        width: width,
        height: height,
        top: top,
        left: left,
        zIndex
      });

      return { members };
    });
  },
  maximizeWindow: (id) => {
    set((state) => {
      const members = [...state.members];
      const zIndex = ++zIndexOffset;
      const { item, parent } = getItemById<IWindow>(state, id);
      if (!isWindow(item) || !hasMembers(parent)) return { members };

      item.previousPosition = {
        top: item.top || 0,
        left: item.left || 0,
        width: item.width || 0,
        height: item.height || 0
      };

      const clientWidth = document.documentElement.clientWidth;
      const clientHeight = document.documentElement.clientHeight;

      Object.assign(item, {
        maximized: true,
        width: clientWidth,
        height: clientHeight,
        top: 0,
        left: 0,
        zIndex
      });

      return { members };
    });
  },
  minimizeWindow: (id) => {
    set((state) => {
      const members = [...state.members];
      const { item, parent } = getItemById<IWindow>(state, id);
      if (!isWindow(item) || !hasMembers(parent)) return { members };

      item.minimized = true;
      item.previousPosition = item.previousPosition || {
        top: item.top || 0,
        left: item.left || 0,
        width: item.width || 0,
        height: item.height || 0
      };

      const minimizedWindows = parent.members.filter((w) => w.minimized);
      const clientHeight = document.documentElement.clientHeight;
      const clientWidth = document.documentElement.clientWidth;

      const findPosition = () => {
        for (let row = 0; row < 4; row++) {
          for (let column = 0; column * 210 + 200 < clientWidth; column++) {
            const left = 10 + column * 210;
            const top = clientHeight - 60 - 60 * row;
            const overlapping = minimizedWindows.some((w) => w.left === left && w.top === top);
            if (!overlapping) {
              return { left, top };
            }
          }
        }
        return { left: 10, top: clientHeight - 60 };
      };

      const newPosition = findPosition();
      Object.assign(item, {
        width: 200,
        height: 58,
        top: newPosition.top,
        left: newPosition.left,
        zIndex: 0
      });

      return { members };
    });
  },
  restoreWindowSize: (id) => {
    set((state) => {
      const members = [...state.members];
      const { item, parent } = getItemById<IWindow>(state, id);
      if (!isWindow(item) || !hasMembers(parent)) return { members };

      const zIndex = ++zIndexOffset;
      if (item.previousPosition) {
        Object.assign(window, {
          top: item.previousPosition.top,
          left: item.previousPosition.left,
          width: item.previousPosition.width,
          height: item.previousPosition.height,
          previousPosition: undefined,
          minimized: false,
          maximized: false,
          zIndex
        });
      }

      return { members };
    });
  },
  closeWindow: (id) => {
    set((state) => {
      const members = [...state.members];
      const { item, parent, index } = getItemById<IWindow>(state, id);
      if (!isWindow(item) || !hasMembers(parent)) return { members };
      parent.members.splice(index, 1);
      return cleanUp(state);
    });
  },
  addWindow: (window) => {
    set((state) => {
      const members = [...state.members];
      const newWindowId = v4();
      const zIndex = ++zIndexOffset;
      members.push({ ...window, id: newWindowId, zIndex });
      return { members };
    });
  },
  detachView: (id) => {
    set((state) => {
      const members = [...state.members];
      const windows = state.members;
      const { item, parent, index } = getItemById<ITabView>(state, id);
      if (!isTabView(item) || !parent) return { members };

      const newWindowId = v4();
      const centerX = document.documentElement.clientWidth / 2 - 400;
      const centerY = document.documentElement.clientHeight / 2 - 300;

      const newGroupView: IGroupView = {
        type: NodeType.GroupView,
        id: v4(),
        members: [item]
      };
      const newWindow: IWindow = {
        type: NodeType.Window,
        id: newWindowId,
        members: [newGroupView],
        floating: true,
        width: 800,
        height: 600,
        top: centerY + (detachOffset % 10) * 20,
        left: centerX + (detachOffset % 10) * 20
      };
      detachOffset++;
      windows.push(newWindow);

      parent.members.splice(index, 1);

      return cleanUp(state);
    });
  },
  attachView: (id) => {
    set((state) => {
      const members = state.members;
      const { item, parent, index } = getItemById<ITabView>(state, id);
      if (!isTabView(item) || !isGroupView(parent)) return { members };

      Object.assign(item, { width: undefined, height: undefined });
      const attachedWindow = members.find((w) => !w.floating);
      const newGroupView: IGroupView = {
        type: NodeType.GroupView,
        id: v4(),
        members: [item]
      };

      if (!attachedWindow) {
        const newWindowId = v4();
        const newWindow: IWindow = {
          type: NodeType.Window,
          id: newWindowId,
          members: [newGroupView],
          floating: false
        };
        members.push(newWindow);
      } else {
        attachedWindow.members.push(newGroupView);
      }
      parent.members.splice(index, 1);

      return cleanUp(state);
    });
  },
  addTabInitial: (tab) => {
    set((state) => {
      const members = [...state.members];

      const newTab: ITab = { type: NodeType.Tab, ...tab, id: tab.id || v4(), title: tab.title || `Untitled ${nextUntitledCount({ members: state.members })}` };
      const newTabView: ITabView = { type: NodeType.TabView, id: v4(), members: [newTab], activeTabId: newTab.id };
      const newGroupView: IGroupView = { type: NodeType.GroupView, id: v4(), members: [newTabView] };
      const newWindow: IWindow = { type: NodeType.Window, floating: false, id: v4(), members: [newGroupView] };

      let firstAttachedWindow: IWindow | undefined = undefined;
      traverse(state, (item) => {
        if (isWindow(item) && !item.floating && !firstAttachedWindow) {
          firstAttachedWindow = item;
          return true;
        }
        return false;
      });
      if (!firstAttachedWindow) {
        members.push(newWindow);
        return { members, home: false };
      }
      let firstGroupView: IGroupView | undefined = undefined;
      traverse(state, (item) => {
        if (isGroupView(item) && !firstGroupView) {
          firstGroupView = item;
          return true;
        }
        return false;
      });
      if (!firstGroupView) {
        (firstAttachedWindow as IWindow).members.push(newGroupView);
        return { members, home: false };
      }
      let firstTabView: ITabView | undefined = undefined;
      traverse(state, (item) => {
        if (isTabView(item) && !firstTabView) {
          firstTabView = item;
          return true;
        }
        return false;
      });
      if (!firstTabView) {
        (firstGroupView as IGroupView).members.push(newTabView);
        return { members, home: false };
      }
      (firstTabView as ITabView).members.push(newTab);
      return { members, home: false };
    });
  },
  changeTab: (id) => {
    set((state) => {
      const members = [...state.members];

      const { parent } = getItemById<ITab>(state, id);
      if (!isTabView(parent)) return { members };
      parent.activeTabId = id;

      return { members };
    });
  },
  closeTab: (tabId) => {
    set((state) => {
      const members = [...state.members];
      const { item, parent, index } = getItemById<ITab>(state, tabId);
      if (!isTabView(parent)) return { members };
      if (!item) return { members };
      parent.members.splice(index, 1);

      return cleanUp(state);
    });
  },
  addTab: (id, tab) => {
    set((state) => {
      const members = [...state.members];
      const { item, parent } = getItemById<ITabView>(state, id);
      if (!isTabView(item) || !parent) return { members };
      const newTab: ITab = { type: NodeType.Tab, ...tab, id: tab.id || v4(), title: tab.title || `Untitled ${nextUntitledCount({ members: state.members })}` };
      item.members.push(newTab);
      item.activeTabId = newTab.id;
      return { members };
    });
  },
  moveTab: ({ tabId, toViewId, beforeTabId }) => {
    set((state) => {
      const members = [...state.members];
      const { item, parent, index } = getItemById(state, tabId);
      if (!isTab(item) || !isTabView(parent)) return { members };

      const { item: toView } = getItemById(state, toViewId);
      if (!isTabView(toView)) return { members };

      //just reorder
      if (parent === toView) {
        if (tabId === beforeTabId) return { members };
        if (beforeTabId) {
          parent.members.splice(index, 1);
          toView.members.splice(findIndexById(toView.members, beforeTabId), 0, item);
        }
      } else {
        //move to another view
        const newActiveTabId = parent.members[index - 1]?.id || (index !== 0 && parent.members[0]?.id) || parent.members[1]?.id;
        if (parent.activeTabId === tabId) parent.activeTabId = newActiveTabId;

        parent.members.splice(index, 1);
        if (beforeTabId) {
          toView.members.splice(findIndexById(toView.members, beforeTabId), 0, item);
        } else {
          toView.members.push(item);
        }
      }
      return cleanUp(state);
    });
  },
  splitView: (id, direction) => {
    set((state) => {
      const members = [...state.members];
      const { item, parent, index, depth } = getItemById<ITabView>(state, id);
      if (!isTabView(item) || !parent || !item.activeTabId) return { members };
      const currentDirection = depth % 2 === 1 ? Direction.Vertical : Direction.Horizontal;

      const activeTabId = item.activeTabId;
      const activeTabIndex = findIndexById(item.members, activeTabId);

      const activeTab = findById(item.members, activeTabId);
      if (!activeTab) return { members };

      const tabs = item.members;
      const previousTabId = tabs[activeTabIndex - 1]?.id;
      const nextTabId = tabs[activeTabIndex + 1]?.id;
      const newActiveTabId = previousTabId || nextTabId;

      if (currentDirection === direction) {
        console.log('call1');
        const newView: ITabView = {
          type: NodeType.TabView,
          id: v4(),
          members: [activeTab],
          activeTabId
        };
        item.activeTabId = newActiveTabId;
        item.members.splice(activeTabIndex, 1);
        parent.members.push(newView);
      } else {
        console.log('call2');
        if (!activeTabId) return { members };

        const replacementView: IGroupView = {
          type: NodeType.GroupView,
          id: v4(),
          members: [
            {
              type: NodeType.TabView,
              id: v4(),
              members: toRemovedById(tabs, activeTabId),
              activeTabId: newActiveTabId
            },
            {
              type: NodeType.TabView,
              id: v4(),
              members: [activeTab],
              activeTabId
            }
          ]
        };
        parent.members.splice(index, 1, replacementView);
      }
      return { members };
    });
  },
  resizeView: (direction: Direction, size, id, nextItemSize) => {
    set((state) => {
      const members = [...state.members];
      if (size < 10) return { members };
      if (nextItemSize && nextItemSize < 200) return { members };
      const { item, parent, index } = getItemById<ITabView | IGroupView>(state, id);
      if (!item || !(isTabView(item) || isGroupView(item)) || !isGroupView(parent)) return { members };
      const nextView = parent.members[index + 1];

      const sizeProp = direction === Direction.Horizontal ? 'width' : 'height';
      item[sizeProp] = size;
      if (nextView) nextView[sizeProp] = nextItemSize;

      return { members };
    });
  },

  flow: undefined,
  setFlow: (flow) => set({ flow }),
  tool: 'selection',
  setTool: (tool) => set({ tool: tool }),
  toolbarColSize: 1,
  setToolbarColSize: (size) => set({ toolbarColSize: size })
}));

const isAppStore = (state: any): state is AppStore => state && 'type' in state && state.type === NodeType.App;
const isWindow = (state: any): state is IWindow => state && 'type' in state && state.type === NodeType.Window;
const isGroupView = (state: any): state is IGroupView => state && 'type' in state && state.type === NodeType.GroupView;
const isTabView = (state: any): state is ITabView => state && 'type' in state && state.type === NodeType.TabView;
const isTab = (state: any): state is ITab => state && 'type' in state && state.type === NodeType.Tab;
const hasMembers = (view: any): view is { members: StateItem[] } => view && 'members' in view;

const cleanObject = (obj: NestedState, level = 0): boolean => {
  level++;
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
        value.members &&
        value.members.length === 1 &&
        value.members[0].type === NodeType.GroupView
      ) {
        Object.assign(value, value.members[0]);
        somethingRemoved = true;
      } else {
        if (cleanObject(value, level)) {
          somethingRemoved = true;
        }
      }
    }
  });

  return somethingRemoved;
};
const cleanUp = (state: { members: IWindow[] }) => {
  do {} while (cleanObject(state));
  let newWindows = state.members.filter(Boolean);

  return { members: newWindows, home: newWindows.length === 0 };
};
const updateSizes = (win: NestedState, widthChange: number, heightChange: number) => {
  traverse(win, (item) => {
    if ('height' in item && 'width' in item) {
      item.width = item.width ? item.width * widthChange : undefined;
      item.height = item.height ? item.height * heightChange : undefined;
    }
    return false;
  });
};

const nextUntitledCount = (state: NestedState) => {
  const titles: string[] = [];
  traverse(state, (item) => {
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

type LookupResult<T> = { item: T | null; parent: ParentType<T> | null; index: number; depth: number };

//TODO: implement with traverse function
const getItemById = <T extends StateItem>(state: NestedState, id: string, depth: number = 0): LookupResult<T> => {
  if ('id' in state && state.id === id) {
    return { item: state, parent: null, index: -1, depth } as LookupResult<T>;
  }
  if ('members' in state && state.members) {
    for (let i = 0; i < state.members.length; i++) {
      if (state.members[i].id === id) {
        return { item: state.members[i], parent: state, index: i, depth: depth + 1 } as LookupResult<T>;
      }
      let result = getItemById(state.members[i], id, depth + 1);
      if (result.item) {
        return result as LookupResult<T>;
      }
    }
  }

  return { item: null, parent: null, index: -1 } as LookupResult<T>;
};

const traverse = <T extends (...params: any[]) => any>(state: NestedState, func: T): any => {
  if (func(state)) {
    return true;
  }
  if ('members' in state) {
    state.members.some((child: NestedState) => traverse(child, func));
  }
  return false;
};
