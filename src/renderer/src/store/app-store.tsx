import { create } from 'zustand'
import { FlowPageProvided } from '../components/FlowPage'
import { ReactFlowInstance } from 'reactflow'
import { Direction } from '@renderer/components/application-layout/types'

export interface TabItem {
  id: string
  title: string
  content: React.ReactNode
}
export interface TabViewItem {
  tabs: TabItem[]
  activeTabId?: string
  size?: number
}
export type ViewsItem = TabViewItem | Views | null
export type Views = {
  views: ViewsItem[]
  size?: number
}
export interface AppStore {
  views: ViewsItem[]
  //activeTabs: { [key: string]: string }
  changeTab: (tabId: string, viewPath: number[]) => void
  closeTab: (tabId: string, viewPath: number[]) => void
  addTab: (viewPath: number[], tab: TabItem) => void
  moveTab: (options: { tabId: string; fromPath: number[]; toPath: number[]; beforeTabId?: string }) => void
  splitView: (viewPath: number[], direction: Direction) => void
  resizeView: (size: number, viewPath: number[]) => void
  flow?: ReactFlowInstance
  setFlow: (flow: ReactFlowInstance) => void
  tool: string
  setTool: (tool: string) => void
  toolbarColSize: number
  setToolbarColSize: (size: number) => void
}
export const useApp = create<AppStore>((set) => ({
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
  activeTabs: {},
  changeTab: (tabId, viewPath) => {
    set((state) => {
      const views = [...state.views]

      const view = evalPathArray(viewPath, { views }) as TabViewItem
      view.activeTabId = tabId

      return { views }
    })
  },
  closeTab: (tabId, viewPath) => {
    set((state) => {
      let views = [...state.views]
      const view = evalPathArray(viewPath, { views })
      const tabs = 'tabs' in view ? view.tabs : []
      const tabIndex = tabs.findIndex((tab) => tab.id === tabId)

      tabs.splice(tabIndex, 1)
      const clean = cleanUp({ views })

      return { views: clean.views }
    })
  },
  addTab: (viewPath, tab) => {
    set(({ views }) => {
      const view = evalPathArray(viewPath, { views }) as TabViewItem
      view.tabs.push(tab)
      view.activeTabId = tab.id
      return { views }
    })
  },
  moveTab: ({ tabId, fromPath, toPath, beforeTabId }) => {
    set((state) => {
      let views = [...state.views]
      const fromView = evalPathArray(fromPath, { views }) as TabViewItem
      const toView = evalPathArray(toPath, { views }) as TabViewItem
      const tab = fromView.tabs.find((tab) => tab.id === tabId)
      if (!tab) return { views }
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
      const clean = cleanUp({ views })
      return { views: clean.views }
    })
  },
  splitView: (viewPath, direction) => {

    set((state) => {
      const currentDirection = viewPath.length % 2 === 0 ? Direction.Vertical : Direction.Horizontal
      const views = [...state.views]
      const parentView = evalPathArray(viewPath.slice(0, -1), { views }) as Views
      const view = evalPathArray(viewPath, { views }) as TabViewItem
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
        console.log('call2')
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
      return { views }
    })
  },
  resizeView: (size, viewPath) => {
    console.log('resizeView', viewPath, size)

    set((state) => {

      const views = [...state.views]
      const view = evalPathArray(viewPath, { views }) as Views
      view.size = size


      console.log('resizeView', viewPath, size,views)
      return { views }
    })
  },
  flow: undefined,
  setFlow: (flow) => set({ flow }),
  tool: 'selection',
  setTool: (tool) => set({ tool: tool }),
  toolbarColSize: 1,
  setToolbarColSize: (size) => set({ toolbarColSize: size })
}))

const evalPathArray = (pathArray: number[], views: Views) => {
  let view: TabViewItem | Views = views
  for (const path of pathArray) {
    if ('views' in view) {
      view = view.views[path] as Views
    } else {
      view = view[path] as TabViewItem
    }
  }
  return view
}

function cleanUp(views: Views): Views {
  function cleanViews(currentViews: Views): ViewsItem[] {
    return currentViews.views.reduce((acc: ViewsItem[], item: ViewsItem) => {
      if (isTabViewItem(item)) {
        if (item.tabs.length > 0) {
          acc.push(item)
        }
      } else if (isViews(item)) {
        const cleaned = cleanViews(item)
        if (cleaned.length > 0) {
          acc.push({ views: cleaned, size: item.size })
        }
      }
      return acc
    }, [])
  }

  function isTabViewItem(item: any): item is TabViewItem {
    return item && typeof item === 'object' && 'tabs' in item
  }

  function isViews(item: any): item is Views {
    return item && typeof item === 'object' && 'views' in item
  }

  const cleanedItems = cleanViews(views)
  return { views: cleanedItems, size: views.size }
}
