import { create } from 'zustand'
import { FlowPageProvided } from '../components/FlowPage'
import { ReactFlowInstance } from 'reactflow'
import { Direction } from '@renderer/components/application-layout/types'

export interface TabItem {
  id: string
  title: string
  content: React.ReactNode
}
export interface TabView {
  tabs: TabItem[]
  activeTabId?: string
  width?: number
  height?: number
}
export type ViewsItem = TabView | ContainerView
export type ContainerView = {
  views: ViewsItem[]
  width?: number
  height?: number
}
export type Window = {
  views: ViewsItem[]
  floating?: boolean
  width?: number
  height?: number
  top?: number
  left?: number
}
export interface AppStore {
  windows: Window[]
  resizeWindow: (width: number, height: number, top: number, left: number, viewPath: number[]) => void
  changeTab: (tabId: string, viewPath: number[]) => void
  closeTab: (tabId: string, viewPath: number[]) => void
  addTab: (viewPath: number[], tab: TabItem) => void
  moveTab: (options: { tabId: string; fromPath: number[]; toPath: number[]; beforeTabId?: string }) => void
  splitView: (viewPath: number[], direction: Direction) => void
  resizeView: (direction: Direction, size: number, viewPath: number[], nextItemSize?: number) => void
  flow?: ReactFlowInstance
  setFlow: (flow: ReactFlowInstance) => void
  tool: string
  setTool: (tool: string) => void
  toolbarColSize: number
  setToolbarColSize: (size: number) => void
}
export const useApp = create<AppStore>((set) => ({
  windows: [
    {
      views: [
        {
          tabs: [
            {
              id: 'flow-tab-1',
              title: 'Flow 1',
              content: <FlowPageProvided id="flow-tab-1" />
            }
          ]
        }
      ],
      floating: false
    },
    {
      views: [
        {
          tabs: [
            {
              id: 'flow-tab-1',
              title: 'Flow 2',
              content: <FlowPageProvided id="flow-tab-2" />
            }
          ]
        }
      ],
      floating: true
    }
  ],
  resizeWindow: (width, height, top, left, viewPath) => {
    set((state) => {
      const windows = [...state.windows]
      const window = evalPathArray(viewPath, windows) as Window
      const widthChange = window.width ? width / window.width : 1
      const heightChange = window.height ? height / window.height : 1
      updateSizes(window, widthChange, heightChange)

      window.width = width
      window.height = height
      window.top = top
      window.left = left

      return { windows }
    })
  },
  activeTabs: {},
  changeTab: (tabId, viewPath) => {
    set((state) => {
      const windows = [...state.windows]

      const view = evalPathArray(viewPath, windows) as TabView
      view.activeTabId = tabId

      return { windows }
    })
  },
  closeTab: (tabId, viewPath) => {
    set((state) => {
      const windows = [...state.windows]
      const view = evalPathArray(viewPath, windows)
      const tabs = 'tabs' in view ? view.tabs : []
      const tabIndex = tabs.findIndex((tab) => tab.id === tabId)

      tabs.splice(tabIndex, 1)
      const clean = cleanUp(windows)

      return { windows: clean }
    })
  },
  addTab: (viewPath, tab) => {
    set(({ windows }) => {
      const view = evalPathArray(viewPath, windows) as TabView
      view.tabs.push(tab)
      view.activeTabId = tab.id
      return { windows }
    })
  },
  moveTab: ({ tabId, fromPath, toPath, beforeTabId }) => {
    set((state) => {
      let windows = [...state.windows]
      const fromView = evalPathArray(fromPath, windows) as TabView
      const toView = evalPathArray(toPath, windows) as TabView
      const tab = fromView.tabs.find((tab) => tab.id === tabId)
      if (!tab) return state
      //just reorder
      if (fromView === toView) {
        if (beforeTabId) {
          const beforeTabIndex = toView.tabs.findIndex((tab) => tab.id === beforeTabId)
          const tabIndex = toView.tabs.findIndex((tab) => tab.id === tabId)
          toView.tabs.splice(tabIndex, 1)
          toView.tabs.splice(beforeTabIndex, 0, tab)
        } else {
          const tabIndex = toView.tabs.findIndex((tab) => tab.id === tabId)
          toView.tabs.splice(tabIndex, 1)
          toView.tabs.push(tab)
        }
      } else {
        const movingTabIndex = fromView.tabs.findIndex((tab) => tab.id === tabId)
        const newActiveTab = fromView.tabs[movingTabIndex - 1] || (movingTabIndex !== 0 && fromView.tabs[0]) || fromView.tabs[1]
        if (fromView.activeTabId === tab.id) fromView.activeTabId = newActiveTab?.id
        fromView.tabs = fromView.tabs.filter((tab) => tab.id !== tabId)
        if (beforeTabId) {
          const beforeTabIndex = toView.tabs.findIndex((tab) => tab.id === beforeTabId)
          toView.tabs.splice(beforeTabIndex, 0, tab)
        } else {
          toView.tabs.push(tab)
        }
      }
      const clean = cleanUp(windows)
      return { windows: clean }
    })
  },
  splitView: (viewPath, direction) => {
    set((state) => {
      const currentDirection = viewPath.length % 2 === 1 ? Direction.Vertical : Direction.Horizontal
      let windows = [...state.windows]
      const parentView = evalPathArray(viewPath.slice(0, -1), windows) as ContainerView
      const view = evalPathArray(viewPath, windows) as TabView
      const activeTabIndex = view.tabs.findIndex((tab) => tab.id === view.activeTabId)
      const activeTabId = view.activeTabId
      const activeTab = view.tabs[activeTabIndex]
      const viewIndex = Array.isArray(parentView.views) ? parentView.views.findIndex((v) => v === view) : -1
      const tabs = 'tabs' in view ? view.tabs : []
      const previousTabId = tabs[activeTabIndex - 1]?.id
      const nextTabId = tabs[activeTabIndex + 1]?.id
      const newActiveTabId = previousTabId || nextTabId
      if (currentDirection === direction) {
        const newView = {
          tabs: [activeTab],
          activeTabId
        }
        view.activeTabId = newActiveTabId
        tabs.splice(activeTabIndex, 1)
        parentView.views.push(newView)
      } else {
        const remainingTabs = tabs.filter((tab) => tab.id !== activeTabId)
        const newView = {
          views: [
            {
              tabs: remainingTabs,
              activeTabId: newActiveTabId
            },
            {
              tabs: [activeTab],
              activeTabId
            }
          ]
        }
        parentView.views[viewIndex] = newView
      }
      return { windows }
    })
  },
  resizeView: (direction: Direction, size, viewPath, nextItemSize) => {
    set((state) => {
      if (size < 200) return state
      if (nextItemSize && nextItemSize < 200) return state
      const windows = [...state.windows]
      const view = evalPathArray(viewPath, windows) as ContainerView
      const parentView = evalPathArray(viewPath.slice(0, -1), windows) as ContainerView
      const viewIndex = Array.isArray(parentView.views) ? parentView.views.findIndex((v) => v === view) : -2
      const nextView = parentView.views[viewIndex + 1]

      const sizeProp = direction === Direction.Horizontal ? 'width' : 'height'
      view[sizeProp] = size
      if (nextView) {
        nextView[sizeProp] = nextItemSize
      }

      return { windows }
    })
  },
  flow: undefined,
  setFlow: (flow) => set({ flow }),
  tool: 'selection',
  setTool: (tool) => set({ tool: tool }),
  toolbarColSize: 1,
  setToolbarColSize: (size) => set({ toolbarColSize: size })
}))

const evalPathArray = (pathArray: number[], windows: Window[]) => {
  let view: TabView | ContainerView | Window | Window[] = windows
  for (const path of pathArray) {
    if ('views' in view) {
      view = view.views[path] as ContainerView
    } else {
      view = view[path] as TabView
    }
  }
  return view
}

function cleanUp(windows: Window[]): Window[] {
  function cleanViews(currentViews: ContainerView[] | Window[] | TabView[]): ViewsItem[] {
    const arr = currentViews.reduce((acc: ViewsItem[], item: ViewsItem) => {
      if (isTabView(item)) {
        if (item.tabs.length > 0) {
          acc.push(item)
        }
      } else if (isWindowOrContainerView(item)) {
        const cleaned = cleanViews(item.views as any)
        if (cleaned.length > 0) {
          const { views, ...rest } = item
          acc.push({ views: cleaned, ...rest })
          if (cleaned.length === 1 && cleaned[0]) {
            cleaned[0].width = undefined
            cleaned[0].height = undefined
          }
        }
      }
      return acc
    }, [])
    if (arr[0] && arr.length === 1) {
      arr[0].width = undefined
      arr[0].height = undefined
    }
    return arr
  }

  function isTabView(item: any): item is TabView {
    return item && typeof item === 'object' && 'tabs' in item
  }

  function isWindowOrContainerView(item: any): item is ContainerView | Window {
    return item && typeof item === 'object' && 'views' in item
  }

  const cleanedItems = cleanViews(windows) as Window[]
  return cleanedItems
}

const updateSizes = (win: Window, widthChange: number, heightChange: number) => {
  win.views.forEach((window) => {
    window.width = window.width ? window.width * widthChange : undefined
    window.height = window.height ? window.height * heightChange : undefined
    if ('views' in window) {
      window.views.forEach((view) => {
        if ('views' in view) {
          updateSizes(view, widthChange, heightChange)
        }
      })
    }
  })
}
