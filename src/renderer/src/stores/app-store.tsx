import { create } from 'zustand';
import { FlowPageProvided } from '../components/FlowPage';
import { ReactFlowInstance } from 'reactflow';
import { Direction } from '@renderer/components/application-layout/types';
import { v4 } from 'uuid';
export interface TabItem {
  order?: number;
  title: string;
  content: React.ReactNode;
}
export interface TabView {
  order?: number;
  tabs: Record<string, TabItem>;
  activeTabId?: string;
  width?: number;
  height?: number;
}
export type ViewsItem = TabView | ContainerView;
export type ContainerView = {
  views: Record<string, ViewsItem>;
  width?: number;
  height?: number;
};
export type Window = {
  views: Record<string, ViewsItem>;
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
export interface AppStore {
  windows: Record<string, Window>;
  resizeWindow: (width: number, height: number, top: number, left: number, viewPath: string[]) => void;
  maximizeWindow: (viewPath: string[]) => void;
  minimizeWindow: (viewPath: string[]) => void;
  restoreWindowSize: (viewPath: string[]) => void;
  closeWindow: (viewPath: string[]) => void;
  attachView: (viewPath: string[]) => void;
  detachView: (viewPath: string[]) => void;
  changeTab: (tabId: string, viewPath: string[]) => void;
  closeTab: (tabId: string, viewPath: string[]) => void;
  addTab: (viewPath: string[], tab: TabItem) => void;
  moveTab: (options: { tabId: string; fromPath: string[]; toPath: string[]; beforeTabId?: string }) => void;
  splitView: (viewPath: string[], direction: Direction) => void;
  resizeView: (direction: Direction, size: number, viewPath: string[], nextItemSize?: number) => void;
  flow?: ReactFlowInstance;
  setFlow: (flow: ReactFlowInstance) => void;
  tool: string;
  setTool: (tool: string) => void;
  toolbarColSize: number;
  setToolbarColSize: (size: number) => void;
}
let detachOffset = 0;
let minimizeOffset = 0;
let minimizeOffsetRow = 0;

export const useApp = create<AppStore>((set) => ({
  windows: {
    mainAttachedWindow: {
      views: {
        initialView: {
          tabs: {
            'flow-tab-1': {
              id: 'flow-tab-1',
              title: 'Flow 1',
              content: <FlowPageProvided id="flow-tab-1" />
            }
          }
        },
      },
      floating: false
    }
  },
  resizeWindow: (width, height, top, left, viewPath) => {
    set((state) => {
      const windows = { ...state.windows };
      const lastZIndex = Object.values(windows).reduce((acc, window) => ((window.zIndex || 0) > acc ? window.zIndex || 0 : acc), 0) + 1;
      const window = evalPathArray(viewPath, windows) as Window;
      const widthChange = window.width ? width / window.width : 1;
      const heightChange = window.height ? height / window.height : 1;
      updateSizes(window, widthChange, heightChange);

      window.width = width;
      window.height = height;
      window.top = top;
      window.left = left;
      window.zIndex = lastZIndex;

      return { windows };
    });
  },
  maximizeWindow: (viewPath) => {
    set((state) => {
      const windows = { ...state.windows };
      const lastZIndex = Object.values(windows).reduce((acc, window) => ((window.zIndex || 0) > acc ? window.zIndex || 0 : acc), 0) + 1;

      const window = evalPathArray(viewPath, windows) as Window;
      window.maximized = true;
      window.previousPosition = {
        top: window.top || 0,
        left: window.left || 0,
        width: window.width || 0,
        height: window.height || 0
      };
      const newWidth = document.documentElement.clientWidth;
      const newHeight = document.documentElement.clientHeight;
      const newTop = document.documentElement.clientHeight / 2 - newHeight / 2;
      const newLeft = document.documentElement.clientWidth / 2 - newWidth / 2;
      window.height = innerHeight;
      window.top = newTop;
      window.left = newLeft;
      window.width = newWidth;
      window.zIndex = lastZIndex;

      return { windows };
    });
  },
  minimizeWindow: (viewPath) => {
    set((state) => {
      const windows = { ...state.windows };
      const window = evalPathArray(viewPath, windows) as Window;
      window.minimized = true;
      window.previousPosition = window.previousPosition || {
        top: window.top || 0,
        left: window.left || 0,
        width: window.width || 0,
        height: window.height || 0
      };
      window.width = 200;
      window.height = 58;
      window.zIndex = 0;
      window.top = document.documentElement.clientHeight - 60 - 60 * (minimizeOffsetRow % 4);
      window.left = 10 + minimizeOffset * 210 + 105 * (minimizeOffsetRow % 2);
      minimizeOffset++;
      if (window.left + 400 > document.documentElement.clientWidth) {
        minimizeOffset = 0;
        minimizeOffsetRow++;
      }

      return { windows };
    });
  },
  restoreWindowSize: (viewPath) => {
    set((state) => {
      const windows = { ...state.windows };
      const lastZIndex = Object.values(windows).reduce((acc, window) => ((window.zIndex || 0) > acc ? window.zIndex || 0 : acc), 0) + 1;
      const window = evalPathArray(viewPath, windows) as Window;
      window.minimized = false;
      window.maximized = false;
      window.zIndex = lastZIndex;
      window.top = window.previousPosition?.top;
      window.left = window.previousPosition?.left;
      window.width = window.previousPosition?.width;
      window.height = window.previousPosition?.height;
      window.previousPosition = undefined;

      return { windows };
    });
  },
  closeWindow: (viewPath) => {
    set((state) => {
      const windows = { ...state.windows };
      const parentView = evalPathArray(viewPath.slice(0, -1), windows) as ContainerView;
      const windowId = viewPath[viewPath.length - 1];
      delete parentView[windowId];

      return { windows };
    });
  },
  detachView: (viewPath) => {
    set((state) => {
      const windows = { ...state.windows };
      const viewId = viewPath[viewPath.length - 1];
      const parentView = evalPathArray(viewPath.slice(0, -1), windows) as ContainerView;
      const view = evalPathArray(viewPath, windows) as ViewsItem;
      const newWindowId = v4();
      const newWindow: Window = {
        views: { [viewId]: view },
        floating: true,
        width: 600,
        height: 600,
        top: detachOffset * 20 + document.documentElement.clientHeight / 2 - 300,
        left: detachOffset * 20 + document.documentElement.clientWidth / 2 - 300
      };
      if (detachOffset < 10) detachOffset++;
      else detachOffset = 0;
      windows[newWindowId] = newWindow;
      delete parentView.views[viewId];
      const clean = cleanUp(windows);
      return { windows: clean };
    });
  },
  attachView: (viewPath) => {
    set((state) => {
      const windows = { ...state.windows };
      const viewId = viewPath[viewPath.length - 1];
      const parentView = evalPathArray(viewPath.slice(0, -1), windows) as ContainerView;
      const view = evalPathArray(viewPath, windows) as ViewsItem;
      const findAttachedWindow = Object.entries(windows).find(([id, window]) => !window.floating);
      if (!findAttachedWindow) {
        const newWindowId = v4();
        const newWindow: Window = {
          views: { [viewId]: view },
          floating: false
        };
        windows[newWindowId] = newWindow;
      } else {
        const [attechedWindowId, attachedWindow] = findAttachedWindow;
        attachedWindow.views[viewId] = view;
      }
      delete parentView.views[viewId];

      const clean = cleanUp(windows);
      return { windows: clean };
    });
  },
  changeTab: (tabId, viewPath) => {
    set((state) => {
      const windows = { ...state.windows };

      const view = evalPathArray(viewPath, windows) as TabView;
      view.activeTabId = tabId;

      return { windows };
    });
  },
  closeTab: (tabId, viewPath) => {
    set((state) => {
      const windows = { ...state.windows };
      const view = evalPathArray(viewPath, windows);
      const tabs = 'tabs' in view ? view.tabs : {};
      delete tabs[tabId];
      const clean = cleanUp(windows);

      return { windows: clean };
    });
  },
  addTab: (viewPath, tab) => {
    set(({ windows }) => {
      const id = v4();
      const view = evalPathArray(viewPath, windows) as TabView;
      view.tabs[id] = tab;
      view.activeTabId = id;
      return { windows };
    });
  },
  moveTab: ({ tabId, fromPath, toPath, beforeTabId }) => {
    set((state) => {
      const windows = { ...state.windows };
      const fromView = evalPathArray(fromPath, windows) as TabView;
      const toView = evalPathArray(toPath, windows) as TabView;
      const tab = fromView.tabs[tabId];
      toView.tabs = { ...toView.tabs };
      if (!tab) return state;
      //just reorder
      if (fromView === toView) {
        if (tabId === beforeTabId) return state;

        if (beforeTabId) {
          const beforeTabIndex = indexOf(toView.tabs, beforeTabId);
          const tabIndex = indexOf(toView.tabs, tabId);
          splice(toView.tabs, tabIndex, 1);
          splice(toView.tabs, beforeTabIndex, 0, { [tabId]: tab }, true);
        }
      } else {
        const movingTabIndex = indexOf(fromView.tabs, tabId);
        const newActiveTabId =
          Object.keys(fromView.tabs)[movingTabIndex - 1] || (movingTabIndex !== 0 && Object.keys(fromView.tabs)[0]) || Object.keys(fromView.tabs)[1];
        if (fromView.activeTabId === tabId) fromView.activeTabId = newActiveTabId;
        delete fromView.tabs[tabId];
        if (beforeTabId) {
          const beforeTabIndex = indexOf(toView.tabs, beforeTabId);
          splice(toView.tabs, beforeTabIndex, -1, { [tabId]: tab }, true);
        } else {
          splice(toView.tabs, 0, -1, { [tabId]: tab }, true);
        }
      }
      const clean = cleanUp(windows);
      return { windows: clean };
    });
  },
  splitView: (viewPath, direction) => {
    set((state) => {
      const viewId = viewPath[viewPath.length - 1];
      const currentDirection = viewPath.length % 2 === 1 ? Direction.Vertical : Direction.Horizontal;
      const windows = { ...state.windows };
      const parentView = evalPathArray(viewPath.slice(0, -1), windows) as ContainerView;
      const view = evalPathArray(viewPath, windows) as TabView;
      const activeTabIndex = indexOf(view.tabs, view.activeTabId);
      if (!view.activeTabId) return state;
      const activeTabId = view.activeTabId;
      const activeTab = view.tabs[view.activeTabId];
      const tabs = 'tabs' in view ? view.tabs : {};
      const previousTabId = Object.keys(tabs)[activeTabIndex - 1];
      const nextTabId = Object.keys(tabs)[activeTabIndex + 1];
      const newActiveTabId = previousTabId || nextTabId;
      if (currentDirection === direction) {
        const newView = {
          tabs: { [activeTabId]: activeTab },
          activeTabId
        };
        view.activeTabId = newActiveTabId;
        splice(tabs, activeTabIndex, 1);
        splice(parentView.views, 0, -1, { [v4()]: newView }, true);
      } else {
        if (!activeTabId) return state;
        const { [activeTabId]: removed, ...remainingTabs } = tabs;

        const remainingTabView: TabView = {
          tabs: remainingTabs,
          activeTabId: newActiveTabId
        };
        const newTabView: TabView = {
          tabs: { [activeTabId]: activeTab },
          activeTabId
        };
        const replacementView: ContainerView = {
          views: {
            [viewId]: remainingTabView,
            [v4()]: newTabView
          }
        };
        parentView.views[viewId] = replacementView;
      }
      return { windows };
    });
  },
  resizeView: (direction: Direction, size, viewPath, nextItemSize) => {
    set((state) => {
      if (size < 10) return state;
      if (nextItemSize && nextItemSize < 200) return state;
      console.log({ size, nextItemSize });
      const viewId = viewPath[viewPath.length - 1];
      const windows = { ...state.windows };
      const view = evalPathArray(viewPath, windows) as ContainerView;
      const parentView = evalPathArray(viewPath.slice(0, -1), windows) as ContainerView;
      const viewIndex = parentView.views ? Object.keys(parentView.views).indexOf(viewId) : -2;
      const nextView = parentView.views[Object.keys(parentView.views)[viewIndex + 1]];

      const sizeProp = direction === Direction.Horizontal ? 'width' : 'height';
      view[sizeProp] = size;
      if (nextView) {
        nextView[sizeProp] = nextItemSize;
      }

      return { windows };
    });
  },
  flow: undefined,
  setFlow: (flow) => set({ flow }),
  tool: 'selection',
  setTool: (tool) => set({ tool: tool }),
  toolbarColSize: 1,
  setToolbarColSize: (size) => set({ toolbarColSize: size })
}));

const evalPathArray = (pathArray: string[], windows: Record<string, Window>) => {
  let view: TabItem | TabView | ContainerView | Window | Record<string, Window> = windows;
  for (const path of pathArray) {
    if ('views' in view) {
      view = view.views[path] as ContainerView;
    } else if ('tabs' in view) {
      view = view.tabs[path] as TabItem;
    } else {
      view = view[path] as TabView;
    }
  }
  return view;
};
const cleanUp = (windows: Record<string, Window>) => {
  const isEmpty = (value: unknown) => {
    return value === null || value === undefined || (Array.isArray(value) && value.length === 0) || Object.keys(value).length === 0;
  };
  const cleanObject = (obj: Record<string, any>, level = 0): boolean => {
    level++;
    let keys = Object.keys(obj);
    let somethingRemoved = false;

    keys.forEach((key) => {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        if ('tabs' in value && isEmpty(value.tabs)) {
          delete obj[key];
          somethingRemoved = true;
        } else if ('views' in value && isEmpty(value.views)) {
          delete obj[key];
          somethingRemoved = true;
        } else if ('views' in value && Object.keys(value.views).length === 1 && level > 1) {
          const viewId = Object.keys(value.views)[0];
          Object.assign(value, value.views[viewId]);
          delete value.views;
        } else {
          if (cleanObject(value, level)) {
            somethingRemoved = true;
          }
        }
      }
    });

    return somethingRemoved;
  };
  do {} while (cleanObject(windows));
  return windows;
};

const updateSizes = (win: Window, widthChange: number, heightChange: number) => {
  Object.entries(win.views).forEach(([_id, window]) => {
    window.width = window.width ? window.width * widthChange : undefined;
    window.height = window.height ? window.height * heightChange : undefined;
    if ('views' in window) {
      Object.entries(window.views).forEach(([_id, view]) => {
        if ('views' in view) {
          updateSizes(view, widthChange, heightChange);
        }
      });
    }
  });
};

const indexOf = (object: Record<string, any>, key?: string) => {
  if (!key) return Object.keys(object).length;
  return Object.keys(object).indexOf(key);
};
const splice = (
  object: Record<string, any>,
  index: number,

  /**
   * Negative number means to start from the end, probably just insertion at the end
   */
  deleteCount: number,
  insertionObject?: Record<string, any>,
  generateRandomKeysIfMatching?: boolean
) => {
  const insertionEntries = Object.entries(insertionObject || []);
  const entries = Object.entries(object);

  if (generateRandomKeysIfMatching) {
    insertionEntries.forEach((insertionEntry) => {
      if (entries.find(([k, _v]) => k === insertionEntry[0])) {
        const newKey = v4();
        insertionEntry[0] = newKey;
      }
    });
  }
  let spliced: any;
  if (index === 0 && deleteCount < -1) {
    spliced = entries.splice(entries.length, deleteCount, ...insertionEntries);
  }
  if (index < 0) {
    spliced = entries.splice(entries.length + index, deleteCount, ...insertionEntries);
  } else {
    spliced = entries.splice(index, deleteCount, ...insertionEntries);
  }
  const result = Object.fromEntries(entries);

  Object.keys(object).forEach((key) => {
    delete object[key];
  });
  Object.assign(object, result);

  return Object.fromEntries(spliced);
};
