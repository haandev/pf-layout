import { create } from 'zustand';
import { Direction, IGroupView, ITab, ITabView, IWindow, NodeType } from '../types';
import { cleanUp, lookUp, nextUntitledCount, nextZIndex, remapZIndex, traverse, updateSizes } from '../util';
import { v4 } from 'uuid';
import { SceneEvents } from '../types.event';
import { hasMembers, isGroupView, isTab, isTabView, isWindow } from '../guards';

let detachOffset = 0;

export interface SceneStore {
  //state
  members: IWindow[];

  //actions
  ////window actions
  resizeWindow: (width: number, height: number, top: number, left: number, id: string) => void;
  maximizeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  restoreWindowSize: (id: string) => void;
  moveWindow: (id: string, xDelta: number, yDelta: number) => void;
  windowToFront: (id: string) => void;

  ////view actions
  attachView: (id: string) => void;
  detachView: (id: string, x?: number, y?: number) => void;
  splitTabView: (id: string, direction: Direction) => void;
  mergeTabViews: (options: { id: string; targetId: string; beforeTabId: string }) => void;
  resizeView: (direction: Direction, size: number, id: string, nextItemSize?: number) => void;

  ////tab actions
  addTabInitial: (tab: Omit<ITab, 'type' | 'id' | 'title'> & { id?: string; title?: string }) => void;
  addTab: (id: string, tab: Omit<ITab, 'type' | 'id' | 'title'> & { id?: string; title?: string }) => void;
  changeTab: (id: string) => void;
  closeTab: (id: string) => void;
  moveTab: (options: { tabId: string; toViewId: string; beforeTabId?: string }) => void;

  events: SceneEvents;
}

export const useScene = create<SceneStore>((set) => {
  const events: SceneEvents = {}; //stable ref for events

  return {
    members: [],
    resizeWindow: (width, height, top, left, id) =>
      set((state) => {
        const members = [...state.members];
        const { item, parent } = lookUp<IWindow>(state, id);
        if (!isWindow(item) || !hasMembers(parent)) return { members };

        const widthChange = item.width ? width / item.width : 1;
        const heightChange = item.height ? height / item.height : 1;
        updateSizes(item, widthChange, heightChange);

        Object.assign(item, {
          width: width,
          height: height,
          top: top,
          left: left,
          maximized: widthChange === 1 && heightChange === 1 ? item.maximized : false
        });

        return { members };
      }),
    maximizeWindow: (id) =>
      set((state) => {
        const members = [...state.members];
        const { item, parent } = lookUp<IWindow>(state, id);
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
          zIndex: nextZIndex(state)
        });

        return { members };
      }),
    minimizeWindow: (id) =>
      set((state) => {
        const members = [...state.members];
        const { item, parent } = lookUp<IWindow>(state, id);
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
      }),
    restoreWindowSize: (id) =>
      set((state) => {
        const members = [...state.members];
        const { item, parent } = lookUp<IWindow>(state, id);
        if (!isWindow(item) || !hasMembers(parent)) return { members };

        if (item.previousPosition) {
          Object.assign(item, {
            top: item.previousPosition.top,
            left: item.previousPosition.left,
            width: item.previousPosition.width,
            height: item.previousPosition.height,
            previousPosition: undefined,
            minimized: false,
            maximized: false,
            zIndex: nextZIndex(state)
          });
        }

        return { members };
      }),
    closeWindow: (id) =>
      set((state) => {
        const members = [...state.members];
        const { item, parent, index } = lookUp<IWindow>(state, id);
        if (!isWindow(item) || !hasMembers(parent)) return { members };
        parent.members.splice(index, 1);
        return cleanUp(state);
      }),
    moveWindow: (id, xDelta, yDelta) =>
      set((state) => {
        const members = [...state.members];
        const { item, parent } = lookUp<IWindow>(state, id);
        if (!isWindow(item) || !hasMembers(parent)) return { members };

        Object.assign(item, {
          top: item.top !== undefined ? item.top + yDelta : 0,
          left: item.left !== undefined ? item.left + xDelta : 0,
          zIndex: nextZIndex(state)
        });
        return remapZIndex({ members });
      }),
    windowToFront: (id) =>
      set((state) => {
        const members = [...state.members];
        const { item } = lookUp<IWindow>(state, id);
        if (!isWindow(item)) return { members };
        item.zIndex = nextZIndex(state);
        return remapZIndex({ members });
      }),
    detachView: (id, x, y) =>
      set((state) => {
        const members = [...state.members];
        const { item, parent, index } = lookUp<ITabView>(state, id);
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
          top: y || centerY + (detachOffset % 10) * 20,
          left: x || centerX + (detachOffset % 10) * 20,
          zIndex: nextZIndex(state)
        };
        detachOffset++;
        members.push(newWindow);

        parent.members.splice(index, 1);

        return cleanUp({ members });
      }),
    attachView: (id) =>
      set((state) => {
        const members = state.members;
        const { item, parent, index } = lookUp<ITabView>(state, id);
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
      }),
    addTabInitial: (tab) =>
      set((state) => {
        const members = [...state.members];

        const newTab: ITab = {
          type: NodeType.Tab,
          ...tab,
          id: tab.id || v4(),
          title: tab.title || `Untitled ${nextUntitledCount({ members: state.members })}`
        };
        const newTabView: ITabView = { type: NodeType.TabView, id: v4(), members: [newTab], activeTabId: newTab.id };
        const newGroupView: IGroupView = { type: NodeType.GroupView, id: v4(), members: [newTabView] };
        const newWindow: IWindow = { type: NodeType.Window, floating: false, id: v4(), members: [newGroupView] };

        let firstAttachedWindow: IWindow | undefined = undefined;
        traverse(state, 'members', (item) => {
          if (isWindow(item) && !item.floating && !firstAttachedWindow) {
            firstAttachedWindow = item;
            return true;
          }
          return false;
        });
        if (!firstAttachedWindow) {
          members.push(newWindow);
          state.events.onAddTab?.(newTabView.id, newTab);
          return { members, home: false };
        }
        let firstGroupView: IGroupView | undefined = undefined;
        traverse(state, 'members', (item) => {
          if (isGroupView(item) && !firstGroupView) {
            firstGroupView = item;
            return true;
          }
          return false;
        });
        if (!firstGroupView) {
          (firstAttachedWindow as IWindow).members.push(newGroupView);
          state.events.onAddTab?.(newTabView.id, newTab);
          return { members, home: false };
        }
        let firstTabView: ITabView | undefined = undefined;
        traverse(state, 'members', (item) => {
          if (isTabView(item) && !firstTabView) {
            firstTabView = item;
            return true;
          }
          return false;
        });
        if (!firstTabView) {
          (firstGroupView as IGroupView).members.push(newTabView);
          state.events.onAddTab?.(newTabView.id, newTab);
          return { members, home: false };
        }
        (firstTabView as ITabView).members.push(newTab);
        state.events.onAddTab?.((firstTabView as ITabView).id, newTab);
        return { members, home: false };
      }),
    changeTab: (id) =>
      set((state) => {
        const members = [...state.members];

        const { parent } = lookUp<ITab>(state, id);
        if (!isTabView(parent)) return { members };
        parent.activeTabId = id;

        return { members };
      }),
    closeTab: (tabId) =>
      set((state) => {
        const members = [...state.members];
        const { item, parent, index } = lookUp<ITab>(state, tabId);
        if (!isTabView(parent)) return { members };
        if (!item) return { members };
        parent.members.splice(index, 1);
        state.events.onCloseTab?.(tabId);
        return cleanUp(state);
      }),
    addTab: (id, tab) =>
      set((state) => {
        const members = [...state.members];
        const { item, parent } = lookUp<ITabView>(state, id);
        if (!isTabView(item) || !parent) return { members };
        const newTab: ITab = {
          type: NodeType.Tab,
          ...tab,
          id: tab.id || v4(),
          title: tab.title || `Untitled ${nextUntitledCount({ members: state.members })}`
        };
        item.members.push(newTab);
        item.activeTabId = newTab.id;
        state.events.onAddTab?.(id, newTab);
        return { members };
      }),
    moveTab: ({ tabId, toViewId, beforeTabId }) =>
      set((state) => {
        const members = [...state.members];
        const { item, parent, index } = lookUp(state, tabId);
        if (!isTab(item) || !isTabView(parent)) return { members };

        const { item: toView } = lookUp(state, toViewId);
        if (!isTabView(toView)) return { members };

        const beforeTab = lookUp<ITab>(toView, beforeTabId || '') || {};

        //just reorder
        if (parent === toView) {
          if (tabId === beforeTabId) return { members };
          if (beforeTab.item) {
            parent.members.splice(index, 1);
            const newIndex = beforeTab.item ? (beforeTab.index > index ? beforeTab.index - 1 : beforeTab.index) : toView.members.length;
            toView.members.splice(newIndex, 0, item);
          } else {
            parent.members.splice(index, 1);
            toView.members.push(item);
          }
        } else {
          //move to another view
          const newActiveTabId = parent.members[index - 1]?.id || (index !== 0 && parent.members[0]?.id) || parent.members[1]?.id;
          if (parent.activeTabId === tabId) parent.activeTabId = newActiveTabId;

          parent.members.splice(index, 1);
          if (beforeTab.item) {
            toView.members.splice(beforeTab.index, 0, item);
          } else {
            toView.members.push(item);
          }
        }
        return cleanUp(state);
      }),
    splitTabView: (id, direction) =>
      set((state) => {
        const members = [...state.members];
        const { item, parent, index, depth } = lookUp<ITabView>(state, id);
        if (!isTabView(item) || !parent || !item.activeTabId) return { members };
        const currentDirection = depth % 2 === 1 ? Direction.Vertical : Direction.Horizontal;

        const activeTabId = item.activeTabId;
        const activeTab = lookUp<ITab>(item, activeTabId);
        if (!activeTab.item) return { members };

        const tabs = item.members;
        const previousTabId = tabs[activeTab.index - 1]?.id;
        const nextTabId = tabs[activeTab.index + 1]?.id;
        const newActiveTabId = previousTabId || nextTabId;

        if (currentDirection === direction) {
          const newView: ITabView = {
            type: NodeType.TabView,
            id: v4(),
            members: [activeTab.item],
            activeTabId
          };
          item.activeTabId = newActiveTabId;
          item.members.splice(activeTab.index, 1);
          parent.members.push(newView);
        } else {
          if (!activeTabId) return { members };

          const replacementView: IGroupView = {
            type: NodeType.GroupView,
            id: v4(),
            members: [
              {
                type: NodeType.TabView,
                id: v4(),
                members: tabs.toSpliced(activeTab.index, 1),
                activeTabId: newActiveTabId
              },
              {
                type: NodeType.TabView,
                id: v4(),
                members: [activeTab.item],
                activeTabId
              }
            ]
          };
          parent.members.splice(index, 1, replacementView);
        }
        return { members };
      }),
    resizeView: (direction: Direction, size, id, nextItemSize) =>
      set((state) => {
        const members = [...state.members];
        if (size < 10) return { members };
        if (nextItemSize && nextItemSize < 200) return { members };
        const { item, parent, index } = lookUp<ITabView | IGroupView>(state, id);
        if (!item || !(isTabView(item) || isGroupView(item)) || !isGroupView(parent)) return { members };
        const nextView = parent.members[index + 1];

        const sizeProp = direction === Direction.Horizontal ? 'width' : 'height';
        item[sizeProp] = size;
        if (nextView) nextView[sizeProp] = nextItemSize;

        return { members };
      }),
    mergeTabViews: (options) =>
      set((state) => {
        const members = [...state.members];
        const { item: source, parent: sourceParent, index } = lookUp<ITabView>(state, options.id);
        const { item: target, parent: targetParent } = lookUp<ITabView>(state, options.targetId);
        if (!isTabView(source) || !isTabView(target) || !isGroupView(sourceParent) || target.id === source.id || !parent || !targetParent) return { members };

        const targetTabs = target.members;

        const spliceIndex = options.beforeTabId ? lookUp<ITabView>(target, options.beforeTabId).index || targetTabs.length : targetTabs.length;
        target.members.splice(spliceIndex, 0, ...source.members);
        target.activeTabId = source.activeTabId || target.activeTabId;
        sourceParent.members.splice(index, 1);
        return cleanUp(state);
      }),

    events //just export, events is not reactive, constantly created behind return of store,
  };
});
