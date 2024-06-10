import React, { FC, PropsWithChildren, useEffect, useRef } from 'react'
import { useParentDirection, useValidateElement } from '../hooks'
import clsx from 'clsx'
import IconXmark from '../icons/IconXmark'
import IconAdd from '../icons/IconAdd'
import { useDrag, useDrop } from 'react-dnd'
import { TabViewItem } from '@renderer/store/app-store'
import { useSizeStyle } from '../hooks/use-size-style'
import { Direction } from '../types'
import { ResizeHandle } from '../elements/ResizeHandle'

export type OnTabChangeHandler = (tabId: string, viewPath: number[]) => void
export type OnTabCloseHandler = (tabId: string, viewPath: number[]) => void
export type OnAddNewClickHandler = (viewPath: number[]) => void
export type IsActiveHandler = (tabId: string, viewPath: number[]) => boolean
export type OnTabMoveHandler = (options: { tabId: string; fromPath: number[]; toPath: number[]; beforeTabId?: string }) => void
export type OnResizeHandler = (size: number, viewPath:number[]) => void

export interface TabViewProps extends TabViewItem {
  noCache?: boolean
  activeTabId?: string
  onTabChange?: OnTabChangeHandler
  onTabClose?: OnTabCloseHandler
  headerControls?: React.ReactNode
  onAddNewClick?: OnAddNewClickHandler
  onTabMove?: OnTabMoveHandler
  onResize?: OnResizeHandler
  //don't call directly, used for recursion
  path?: number[]
  size?: number
  direction?: Direction
}
const TabView: FC<TabViewProps> = ({ tabs, activeTabId, path, ...props }) => {
  const rootRef = useRef<HTMLDivElement>(null)
  useValidateElement(rootRef, { $parent: { $match: '.pf-window-group' } }, (validation) => {
    if (!validation) {
      throw new Error('TabView must be used within a Container.')
    }
  })
  const _path = path || [0]
  useEffect(() => {
    if (activeTabId === undefined && tabs.length > 0) {
      props.onTabChange?.(tabs[0].id, _path)
    }
  }, [])

  const onTabChange = (tabId: string) => {
    if (activeTabId !== tabId) {
      props.onTabChange?.(tabId, _path)
    }
  }

  const direction = useParentDirection(rootRef, '.pf-window-group')
  const style = useSizeStyle(props.size,direction)

  const onTabClose = (tabId: string) => {
    const previousTabIndex = tabs.findIndex((tab) => tab.id === tabId) - 1
    const nextTabIndex = tabs.findIndex((tab) => tab.id === tabId) + 1
    if (previousTabIndex >= 0) {
      props.onTabChange?.(tabs[previousTabIndex].id, _path)
    } else if (nextTabIndex < tabs.length) {
      props.onTabChange?.(tabs[nextTabIndex].id, _path)
    }
    props.onTabClose?.(tabId, _path)
  }
  const onAddNew = () => {
    props.onAddNewClick?.(_path)
  }

  const onResize = (size: number) => {
    props.onResize?.(size, _path)
  }

  const [collected, drop] = useDrop<TabDraggingProps, any, any>(() => ({
    accept: 'tab',
    collect: (monitor) => ({
      fromExternalView: monitor.getItem()?.fromPath.join('/') !== _path.join('/') && monitor.isOver()
    }),
    drop: (item) => {
      props.onTabMove?.({ tabId: item.id, fromPath: item.fromPath, toPath: _path })
    }
  }))

  const onDrop = (tabId: string, beforeTabId: string, path: number[]) => {
    props.onTabMove?.({ tabId, fromPath: path, toPath: _path, beforeTabId })
  }
  const content = tabs.find((tab) => tab.id === activeTabId)?.content
  return (
    <div ref={rootRef} className={clsx({ 'pf-tab-view': true, 'pf-highlight': collected.fromExternalView })}

    style={style}
    >
      <ResizeHandle direction={direction} onResize={onResize} />
      <div ref={drop} className={clsx({ 'pf-tab-view__tabs': true, 'pf-hidden': Object.keys(tabs).length === 0 })}>
        <div className="pf-tab-title-list">
          {tabs.map((tab, index) => (
            <Tab
              index={index}
              path={_path}
              className="pf-tab-view__tab-title"
              key={tab.id}
              id={tab.id}
              children={tab.title}
              isActive={tab.id === activeTabId}
              onClick={onTabChange}
              onClose={onTabClose}
              onDrop={onDrop}
            />
          ))}
          <button id="add-new" className="pf-tab-view__add" key="add-new" onClick={onAddNew}>
            <IconAdd width={16} height={16} />
          </button>
        </div>
        <div>{props.headerControls}</div>
      </div>
      <div className="pf-tab-view__content">
        {props.noCache ? (
          <div className="pf-tab-view__content-inner">{content}</div>
        ) : (
          tabs.map((tab) => (
            <div
              key={tab.id}
              className={clsx({
                'pf-tab-view__content-inner': true,
                'pf-hidden': tab.id !== activeTabId
              })}
            >
              {tab.content}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
interface TabProps extends PropsWithChildren {
  id: string
  isActive?: boolean
  onClose?: (tabId: string) => void
  onClick?: (tabId: string) => void
  onDrop?: (tabId: string, beforeTabId: string, path: number[]) => void
  className?: string
  path: number[]
  index: number
}
export interface TabDraggingProps {
  id: string
  fromPath: number[]
}
const Tab: FC<TabProps> = (props) => {
  const ref = useRef(null)
  const [collect, drag] = useDrag<TabDraggingProps>(() => ({
    type: 'tab',
    item: { id: props.id, fromPath: props.path },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))
  const [, drop] = useDrop<TabDraggingProps>(() => ({
    accept: 'tab',
    hover: (item) => {
      props.onDrop?.(item.id, props.id, props.path)
    }
  }))
  const className = clsx({ 'pf-tab': true, 'pf-tab-active': props.isActive, 'pf-tab-is-dragging': collect.isDragging, [props.className || '']: true })
  const onClose = (e) => {
    e.stopPropagation()
    props.onClose?.(props.id)
  }
  const onClick = () => {
    props.onClick?.(props.id)
  }
  drag(drop(ref))
  return (
    <div ref={ref} onClick={onClick} className={className}>
      {props.onClose && (
        <button className="pf-tab__close" onClick={onClose}>
          <IconXmark width={10} height={10} />
        </button>
      )}
      {props.children}
    </div>
  )
}

export default TabView
