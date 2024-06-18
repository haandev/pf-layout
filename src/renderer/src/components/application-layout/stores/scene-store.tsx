import { create } from 'zustand';
import {
  AsRegisterArgs,
  Direction,
  GatheredGroupView,
  GatheredTab,
  GatheredTabView,
  GatheredWindow,
  IGroupView,
  ITab,
  ITabView,
  IWindow,
  Maybe,
  NodeType,
  PartialBy
} from '../types';
import { cleanUp, lookUp, nextUntitledCount, nextZIndex, remapZIndex, traverse } from '../util';
import { v4 } from 'uuid';
import { SceneEvents } from '../types.event';
import { isGroupView, isTab, isTabView, isWindow } from '../guards';

let detachOffset = 0;

export interface SceneStore {
  //state
  members: IWindow[];

  /**
   * Retrieves a window with a given id or creates a new one if it doesn't exist.
   * To create new window, pass an object with the window's properties.
   * @param window - The id of the window or an object with the window's properties.
   * @returns The GatheredWindow that also has the methods to manipulate the window.
   */
  $window: <T extends string | AsRegisterArgs<IWindow>>(
    window: T
  ) => T extends string ? Maybe<GatheredWindow> : GatheredWindow;

  /**
   * Retrieves a group view (contains other group views or tab views) with a given id or creates a new one if it doesn't exist.
   * To create new group view, pass an object with the group view's properties.
   * @param groupView - The id of the group view or an object with the group view's properties.
   * @returns The GatheredGroupView that also has the methods to manipulate the group view.
   */
  $groupView: <T extends string | AsRegisterArgs<IGroupView>>(
    groupView: T,
    hostId?: string
  ) => T extends string ? Maybe<GatheredGroupView> : GatheredGroupView;

  /**
   * Retrieves a tab view with a given id or creates a new one if it doesn't exist.
   * To create new tab view, pass an object with the tab view's properties.
   * @param tabView - The id of the tab view or an object with the tab view's properties.
   * @returns The GatheredTabView that also has the methods to manipulate the tab view.
   */
  $tabView: <T extends string | AsRegisterArgs<ITabView>>(
    tabView: T,
    hostId?: string
  ) => T extends string ? Maybe<GatheredTabView> : GatheredTabView;

  /**
   * Retrieves a tab with a given id or creates a new one if it doesn't exist.
   * To create new tab, pass an object with the tab's properties.
   * @param tab - The id of the tab or an object with the tab's properties.
   * @returns The GatheredTab that also has the methods to manipulate the tab.
   */
  $tab: <T extends string | AsRegisterArgs<ITab>>(
    tab: T,
    hostId?: string
  ) => T extends string ? Maybe<GatheredTab> : GatheredTab;

  /**
   * Adds a new tab to the scene. The tab will be added to the first available tab view.
   * If there are no tab views, a new window with a new group view and a new tab view will be created.
   */
  addTab: (tab: PartialBy<AsRegisterArgs<ITab>, 'id' | 'content' | 'title'>) => void;

  /**
   * Assigns events to the scene store. Not all events are required.
   * This assignment will not cause a re-render.
   * @param events - The events to assign.
   */
  assignEvents: (events: Partial<SceneEvents>) => void;

  /**
   * Getter for the events object. Not assignable.
   * Readonly. Use assignEvents method to assign events.
   * @returns The events object.
   */
  events: SceneEvents;

  //draft
  resizeView: (direction: Direction, size: number, id: string, nextItemSize?: number) => void;
}

export const useScene = create<SceneStore>((set, get) => {
  const events: SceneEvents = {}; //stable ref for events

  const windowMembers = (win: AsRegisterArgs<IWindow>) => {
    const typedMembers = (win.members || []).map((gv) => ({
      ...gv,
      type: NodeType.GroupView as NodeType.GroupView,
      members: groupViewMembers(gv)
    }));
    const typedWindow: IWindow = { ...win, type: NodeType.Window as NodeType.Window, members: typedMembers };
    return typedMembers.map((gv) => getGroupView(gv, typedWindow));
  };
  const groupViewMembers = (group: AsRegisterArgs<IGroupView>): (GatheredGroupView | GatheredTabView)[] => {
    const typedMembers: (IGroupView | ITabView)[] = (group.members || []).map((subView) => {
      if (isGroupView(subView))
        return {
          ...subView,
          type: NodeType.GroupView as NodeType.GroupView,
          members: groupViewMembers(subView)
        };

      return {
        ...subView,
        type: NodeType.TabView as NodeType.TabView,
        members: tabViewMembers(subView as ITabView)
      };
    });
    const typedGroup: IGroupView = { ...group, type: NodeType.GroupView as NodeType.GroupView, members: typedMembers };
    return typedMembers.map((subView) => {
      if (isGroupView(subView)) return getGroupView(subView, typedGroup);
      return getTabView(subView as ITabView, typedGroup);
    });
  };
  const tabViewMembers = (tabView: AsRegisterArgs<ITabView>) => {
    const typedMembers = (tabView.members || []).map((tab) => ({
      ...tab,
      type: NodeType.Tab as NodeType.Tab,
      content: tab.content || events.newTabContent?.()
    }));
    const typedTabView: ITabView = { ...tabView, type: NodeType.TabView as NodeType.TabView, members: typedMembers };
    return typedMembers.map((tab) => getTab(tab, typedTabView));
  };
  const getWindow = (win: IWindow): GatheredWindow => {
    return {
      ...win,
      get members() {
        return windowMembers(win);
      },
      $group: (group) => {
        return get().$groupView(group);
      },
      $set: (attributes) => {
        set((state) => {
          Object.assign(win, attributes);
          return { members: state.members };
        });
      },
      $move: (xDelta, yDelta) => {
        set((state) => {
          Object.assign(win, {
            top: win.top !== undefined ? win.top + yDelta : 0,
            left: win.left !== undefined ? win.left + xDelta : 0
          });
          events.onWindowMove?.(win.id, { top: win.top || 0, left: win.left || 0 });
          return remapZIndex({ members: state.members });
        });
      },
      $close: () => {
        set((state) => {
          const index = state.members.indexOf(win);
          state.members.splice(index, 1);
          return cleanUp(state);
        });
      },
      $resize: (width, height, top, left) => {
        set((state) => {
          Object.assign(win, { width, height, top, left });
          events.onWindowResize?.(win.id, { width, height, top, left });
          return { members: state.members };
        });
      },
      $maximize: () => {
        set((state) => {
          const clientWidth = document.documentElement.clientWidth;
          const clientHeight = document.documentElement.clientHeight;
          Object.assign(win, {
            maximized: true,
            width: clientWidth,
            height: clientHeight,
            top: 0,
            left: 0,
            zIndex: nextZIndex(state)
          });
          events.onWindowResize?.(win.id, { width: clientWidth, height: clientHeight, top: 0, left: 0 });
          return { members: state.members };
        });
      },
      $minimize: () => {
        set((state) => {
          const minimizedWindows = state.members.filter((w) => w.minimized);
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
          Object.assign(win, {
            width: 200,
            height: 58,
            top: newPosition.top,
            left: newPosition.left,
            zIndex: 0
          });
          return { members: state.members };
        });
      },
      $restore: () => {
        set((state) => {
          if (win.previousPosition) {
            Object.assign(win, {
              top: win.previousPosition.top,
              left: win.previousPosition.left,
              width: win.previousPosition.width,
              height: win.previousPosition.height,
              previousPosition: undefined,
              minimized: false,
              maximized: false,
              zIndex: nextZIndex(state)
            });
          }
          events.onWindowResize?.(win.id, {
            width: win.width || 0,
            height: win.height || 0,
            top: win.top || 0,
            left: win.left || 0
          });
          return { members: state.members };
        });
      },
      $bringToFront: () => {
        set((state) => {
          win.zIndex = nextZIndex(state);
          return remapZIndex({ members: state.members });
        });
      }
    };
  };
  const getGroupView = (group: IGroupView, parent: IGroupView | IWindow): GatheredGroupView => {
    return {
      ...group,
      get members() {
        return groupViewMembers(group);
      },
      $tabView: (tabView) => {
        return get().$tabView(tabView);
      },
      $subGroupView: (subGroupView) => {
        return get().$groupView(subGroupView);
      },
      $anyChildrenView: (childView) => {
        const groupViewChildren = get().$groupView(childView as string | AsRegisterArgs<IGroupView>);
        const tabViewChildren = get().$tabView(childView as string | AsRegisterArgs<ITabView>);
        return (groupViewChildren || tabViewChildren) as any;
      },
      $parent: isGroupView(parent) ? get().$groupView(parent) : isWindow(parent) ? getWindow(parent) : undefined,
      $set: (attributes) => {
        set((state) => {
          Object.assign(group, attributes);
          return { members: state.members };
        });
      }
    };
  };
  const getTabView = (tabView: ITabView, parent: IGroupView): GatheredTabView => {
    return {
      ...tabView,
      get members() {
        return tabViewMembers(tabView);
      },
      $tab: (tab) => {
        return get().$tab(tab);
      },
      $parent: get().$groupView(parent),
      $set: (attributes) => {
        set((state) => {
          Object.assign(tabView, attributes);
          return { members: state.members };
        });
      },
      $detach: (x, y) => {
        set((state) => {
          const members = [...state.members];
          const newWindowId = v4();
          const centerX = document.documentElement.clientWidth / 2 - 400;
          const centerY = document.documentElement.clientHeight / 2 - 300;

          const newGroupView: IGroupView = {
            type: NodeType.GroupView,
            id: v4(),
            members: [tabView]
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

          parent.members.splice(parent.members.indexOf(tabView), 1);
          state.events.onDetach?.(tabView.id);
          return cleanUp({ members });
        });
      },
      $attach: () => {
        set((state) => {
          const members = [...state.members];
          Object.assign(tabView, { width: undefined, height: undefined });
          const attachedWindow = members.find((w) => !w.floating);

          const newGroupView: IGroupView = {
            type: NodeType.GroupView,
            id: v4(),
            members: [tabView]
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
          parent.members.splice(parent.members.indexOf(tabView), 1);

          return cleanUp(state);
        });
      },
      $addTab: (tab) => {
        set((state) => {
          const members = [...state.members];
          const newTab: ITab = {
            type: NodeType.Tab,
            ...tab,
            id: tab.id || v4(),
            content: tab.content || state.events.newTabContent?.(),
            title: tab.title || `Untitled ${nextUntitledCount({ members: state.members })}`
          };
          tabView.members.push(newTab);
          tabView.activeTabId = newTab.id;
          state.events.onAddTab?.(tabView.id, newTab);
          return { members };
        });
      },
      $changeActiveTab: (tabId) => {
        set((state) => {
          tabView.activeTabId = tabId;
          return { members: state.members };
        });
      },
      $split: (direction) => {
        set((state) => {
          const members = [...state.members];
          const { item, parent, index, depth } = lookUp<ITabView>(state, tabView.id);
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
                  members: (tabs as any).toSpliced(activeTab.index, 1),
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
        });
      },
      $closeTab: (tabId) => {
        set((state) => {
          const members = [...state.members];
          const index = parent.members.findIndex((f) => f.id === tabView.id);
          parent.members.splice(index, 1);
          state.events.onCloseTab?.(parent.id, tabId);
          return cleanUp({ members });
        });
      },
      $moveTabToView: (tabId, beforeTabId) => {
        set((state) => {
          const members = [...state.members];

          const { item: tab, parent, index } = lookUp<ITab>(get(), tabId);
          if (!isTab(tab) || !parent) return state;

          const beforeTab = lookUp<ITab>(tabView, beforeTabId || '') || {};

          //just reorder
          if (tabView === parent) {
            console.log('reorder');
            if (tabId === beforeTabId) return { members };
            if (beforeTab.item) {
              tabView.members.splice(index, 1);
              const newIndex = beforeTab.item
                ? beforeTab.index > index
                  ? beforeTab.index - 1
                  : beforeTab.index
                : tabView.members.length;
              tabView.members.splice(newIndex, 0, tab);
            } else {
              tabView.members.splice(index, 1);
              tabView.members.push(tab);
            }
          } else {
            console.log('move');
            //move to another view
            const newActiveTabId =
              tabView.members[index - 1]?.id || (index !== 0 && tabView.members[0]?.id) || tabView.members[1]?.id;
            if (tabView.activeTabId === tab.id) tabView.activeTabId = newActiveTabId;

            parent.members.splice(index, 1);
            if (beforeTab.item) {
              tabView.members.splice(beforeTab.index, 0, tab);
            } else {
              tabView.members.push(tab);
            }
          }
          state.events.onMoveTab?.(tab.id, { toViewId: tabView.id, beforeTabId });
          return cleanUp({ members });
        });
      }
    };
  };
  const getTab = (tab: ITab, parent: ITabView): GatheredTab => {
    return {
      ...tab,
      $parent: get().$tabView(parent),
      $set: (attributes) => {
        set((state) => {
          Object.assign(tab, attributes);
          return { members: state.members };
        });
      }
    };
  };

  return {
    members: [],

    get events() {
      return events;
    },
    $window: (win) => {
      if (typeof win === 'string') {
        const window = lookUp<IWindow>(get(), win).item;
        if (isWindow(window)) return getWindow(window);
        return undefined as any;
      } else {
        const { item } = lookUp<IWindow>(get(), win.id);
        if (isWindow(item)) return getWindow(item);

        const newWindow: IWindow = {
          type: NodeType.Window,
          ...win,
          members: windowMembers(win)
        };
        set((state) => {
          state.members.push(newWindow);
          return { members: state.members };
        });
        return getWindow(newWindow);
      }
    },
    $groupView: (groupView, hostId) => {
      if (typeof groupView === 'string') {
        const { item, parent } = lookUp<IGroupView>(get(), groupView);
        if (!isGroupView(item) || !parent) return undefined as any;
        return getGroupView(item, parent);
      } else {
        const { item, parent } = lookUp<IGroupView>(get(), groupView.id);
        if (isGroupView(item) && parent) return getGroupView(item, parent);
        const { item: host } = lookUp<IGroupView>(get(), hostId);
        if (!isGroupView(host)) throw new Error('Invalid host');

        const newGroupView: IGroupView = {
          type: NodeType.GroupView,
          ...groupView,
          members: groupViewMembers(groupView)
        };
        set((state) => {
          host.members.push(newGroupView);
          return { members: state.members };
        });
        return getGroupView(newGroupView, host);
      }
    },
    $tabView: (tabView, hostId) => {
      if (typeof tabView === 'string') {
        const { item, parent } = lookUp<ITabView>(get(), tabView);
        if (!isTabView(item) || !parent) return undefined as any;
        return getTabView(item, parent);
      } else {
        const { item, parent } = lookUp<ITabView>(get(), tabView.id);
        if (isTabView(item) && parent) return getTabView(item, parent);
        const { item: host } = lookUp<IGroupView>(get(), hostId);
        if (!isGroupView(host)) throw new Error('Invalid host');

        const newTabView: ITabView = {
          type: NodeType.TabView,
          ...tabView,
          members: tabViewMembers(tabView)
        };
        set((state) => {
          host.members.push(newTabView);
          return { members: state.members };
        });
        return getTabView(newTabView, host);
      }
    },
    $tab: (tab, hostId) => {
      if (typeof tab === 'string') {
        const { item, parent } = lookUp<ITab>(get(), tab);
        if (!isTab(item) || !parent) return undefined as any;
        return getTab(item, parent);
      } else {
        const { item, parent } = lookUp<ITab>(get(), tab.id);
        if (isTab(item) && parent) return getTab(item, parent);
        const { item: host } = lookUp<ITabView>(get(), hostId);
        if (!isTabView(host)) throw new Error('Invalid host');

        const newTab: ITab = {
          type: NodeType.Tab,
          ...tab,
          content: tab.content || events.newTabContent?.()
        };
        set((state) => {
          host.members.push(newTab);
          return { members: state.members };
        });
        return getTab(newTab, host);
      }
    },
    addTab: (tab) => {
      return set((state) => {
        const members = [...state.members];
        const newTab: ITab = {
          type: NodeType.Tab,
          ...tab,
          content: tab.content || events.newTabContent?.(),
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
      });
    },
    resizeView: (direction: Direction, size, id, nextItemSize) => {
      return set((state) => {
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
      });
    },
    assignEvents: (newEvents) => {
      Object.assign(events, newEvents);
    }
  };
});
