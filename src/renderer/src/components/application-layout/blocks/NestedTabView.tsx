import { TabItem, ContainerView } from '@renderer/store/app-store'
import { Direction } from '../types'
import { FC } from 'react'
import TabView, { IsActiveHandler, OnAddNewClickHandler, OnSplitResizeHandler, OnTabChangeHandler, OnTabCloseHandler, OnTabMoveHandler } from './TabView'
import { WindowGroup } from './WindowGroup'

export interface NestedTabViewProps {
  view: ContainerView
  direction?: Direction

  onTabChange?: OnTabChangeHandler
  onTabClose?: OnTabCloseHandler
  onResize?: OnSplitResizeHandler
  isActive?: IsActiveHandler

  headerControls?: {
    isVisible: (tabs: TabItem[], viewPath: number[]) => boolean
    onClick: (viewPath: number[]) => void
    render: JSX.Element
  }[]

  onAddNewClick?: OnAddNewClickHandler
  onTabMove?: OnTabMoveHandler

  index?: number
  //don't call directly, used for recursion
  path?: number[]
}
export const NestedTabView: FC<NestedTabViewProps> = ({
  view,
  direction,
  path,
  onTabChange,
  onTabClose,
  headerControls,
  onAddNewClick,
  onTabMove,
  onResize,
  index
}) => {
  const _direction = direction || Direction.Horizontal
  const _path = path || [index || 0]
  const oppositeDirection = _direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal
  return view.views.map((viewItem, idx) => {
    const __path = _path ? [..._path, idx] : [idx]
    const pathKey = __path.join('/')
    if (!viewItem) return null
    if ('tabs' in viewItem) {
      const activeTabId = viewItem.activeTabId
      const renderedHeaderControls = headerControls?.map(
        (control, idx) =>
          control.isVisible(viewItem.tabs, __path) && (
            <button key={idx} className="pf-tab-header-button" onClick={() => control.onClick(__path)}>
              {control.render}
            </button>
          )
      )
      return (
        <TabView
          direction={_direction}
          onResize={onResize}
          key={pathKey}
          path={__path}
          tabs={viewItem.tabs}
          activeTabId={activeTabId}
          onTabChange={onTabChange}
          onTabClose={onTabClose}
          onTabMove={onTabMove}
          onAddNewClick={onAddNewClick}
          headerControls={renderedHeaderControls}
          width={viewItem.width}
          height={viewItem.height}
        />
      )
    } else {
      return (
        <WindowGroup key={pathKey} direction={oppositeDirection}
        width={viewItem.width} height={viewItem.height}

        path={__path} onResize={onResize}>
          <NestedTabView
            onResize={onResize}
            onTabMove={onTabMove}
            view={viewItem}
            direction={oppositeDirection}
            path={__path}
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
