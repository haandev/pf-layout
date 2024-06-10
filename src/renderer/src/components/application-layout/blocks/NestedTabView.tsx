import { TabItem, Views } from '@renderer/store/app-store'
import { Direction } from '../types'
import { FC } from 'react'
import TabView, { IsActiveHandler, OnAddNewClickHandler, OnResizeHandler, OnTabChangeHandler, OnTabCloseHandler, OnTabMoveHandler } from './TabView'
import { WindowGroup } from './WindowGroup'

export interface NestedTabViewProps {
  views: Views
  direction: Direction

  onTabChange?: OnTabChangeHandler
  onTabClose?: OnTabCloseHandler
  onResize?: OnResizeHandler
  isActive?: IsActiveHandler

  headerControls?: {
    isVisible: (tabs: TabItem[], viewPath: number[]) => boolean
    onClick: (viewPath: number[]) => void
    render: JSX.Element
  }[]

  onAddNewClick?: OnAddNewClickHandler
  onTabMove?: OnTabMoveHandler

  //don't call directly, used for recursion
  path?: number[]
}
export const NestedTabView: FC<NestedTabViewProps> = ({
  views,
  direction,
  path,
  onTabChange,
  onTabClose,
  headerControls,
  onAddNewClick,
  onTabMove,
  onResize
}) => {
  const oppositeDirection = direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal
  return views.views.map((viewsOrView, idx) => {
    const _path = path ? [...path, idx] : [idx]
    const pathKey = _path.join('/')
    if (!viewsOrView) return null
    if ('tabs' in viewsOrView) {
      const activeTabId = viewsOrView.activeTabId
      const renderedHeaderControls = headerControls?.map(
        (control, idx) =>
          control.isVisible(viewsOrView.tabs, _path) && (
            <button key={idx} className="pf-tab-header-button" onClick={() => control.onClick(_path)}>
              {control.render}
            </button>
          )
      )
      return (
        <TabView
          direction={direction}
          onResize={onResize}
          key={pathKey}
          path={_path}
          tabs={viewsOrView.tabs}
          activeTabId={activeTabId}
          onTabChange={onTabChange}
          onTabClose={onTabClose}
          onTabMove={onTabMove}
          onAddNewClick={onAddNewClick}
          headerControls={renderedHeaderControls}
          size={viewsOrView.size}
        />
      )
    } else {
      return (
        <WindowGroup key={pathKey} direction={oppositeDirection} size={viewsOrView.size} path={_path} onResize={onResize}>
          <NestedTabView
            onResize={onResize}
            onTabMove={onTabMove}
            views={viewsOrView}
            direction={oppositeDirection}
            path={_path}
            onTabChange={onTabChange}
            onTabClose={onTabClose}
            headerControls={headerControls}
            onAddNewClick={onAddNewClick}
          />
        </WindowGroup>
      )
    }
  })
}
