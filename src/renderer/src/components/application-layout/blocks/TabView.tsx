import clsx from 'clsx'
import { useDrag, useDrop } from 'react-dnd'

import React, { FC, PropsWithChildren, useEffect, useRef } from 'react'
import { useParentDirection, useValidateElement, SplitResizeHandle } from '..'
import { Direction } from '../types'

import IconXmark from '../icons/IconXmark'
import IconAdd from '../icons/IconAdd'
import { TabView as TabViewType } from '@renderer/store/app-store'

export type OnTabChangeHandler = (tabId: string, viewPath: string[]) => void
export type OnTabCloseHandler = (tabId: string, viewPath: string[]) => void
export type OnAddNewClickHandler = (viewPath: string[]) => void
export type IsActiveHandler = (tabId: string, viewPath: string[]) => boolean
export type OnTabMoveHandler = (options: { tabId: string; fromPath: string[]; toPath: string[]; beforeTabId?: string }) => void
export type OnSplitResizeHandler = (direction: Direction, size: number, viewPath: string[], nextItemSize?: number) => void

export interface TabViewProps extends TabViewType {
  noCache?: boolean
  activeTabId?: string
  onTabChange?: OnTabChangeHandler
  onTabClose?: OnTabCloseHandler
  headerControls?: React.ReactNode
  onAddNewClick?: OnAddNewClickHandler
  onTabMove?: OnTabMoveHandler
  onResize?: OnSplitResizeHandler
  id: string //path member
  //don't call directly, used for recursion
  path?: string[]
  direction?: Direction
}
const TabView: FC<TabViewProps> = ({ tabs, activeTabId, path, id, ...props }) => {
  const rootRef = useRef<HTMLDivElement>(null)
  useValidateElement(rootRef, { $parent: { $match: '.pf-view-group,.pf-window_content' } }, (validation) => {
    if (!validation) {
      throw new Error('TabView must be used within a Container.')
    }
  })
  const currentPath = [...(path || []), id]

  const tabsEntries = Object.entries(tabs)
  useEffect(() => {
    if (activeTabId === undefined && tabsEntries.length > 0) {
      props.onTabChange?.(tabsEntries[0][0], currentPath)
    }
  }, [])

  const onTabChange = (tabId: string) => {
    if (activeTabId !== tabId) {
      props.onTabChange?.(tabId, currentPath)
    }
  }

  const direction = useParentDirection(rootRef, '.pf-view-group')
  const style = {
    width: props.width,
    height: props.height,
    minWidth: props.width,
    minHeight: props.height
  }

  const onTabClose = (tabId: string) => {
    const previousTabIndex = tabsEntries.findIndex(([id]) => id === tabId) - 1
    const nextTabIndex = tabsEntries.findIndex(([id]) => id === tabId) + 1
    if (previousTabIndex >= 0) {
      props.onTabChange?.(tabsEntries[previousTabIndex][0], currentPath)
    } else if (nextTabIndex < tabsEntries.length) {
      props.onTabChange?.(tabsEntries[nextTabIndex][0], currentPath)
    }
    props.onTabClose?.(tabId, currentPath)
  }
  const onAddNew = () => {
    props.onAddNewClick?.(currentPath)
  }

  const onResize = (size: number, nextItemSize?: number) => {
    props.onResize?.(direction, size, currentPath, nextItemSize)
  }

  const [collected, drop] = useDrop<TabDraggingProps, any, any>(() => ({
    accept: 'tab',
    collect: (monitor) => {
      return ({
        fromExternalView: monitor.isOver() && monitor.getItem()?.fromPath?.join('/') !== currentPath?.join('/')
      })
    },
    drop: (item) => {
      props.onTabMove?.({ tabId: item.id, fromPath: item.fromPath, toPath: currentPath })
    }
  }))

  const onDrop = (tabId: string, beforeTabId: string, path: string[]) => {
    props.onTabMove?.({ tabId, fromPath: path, toPath: currentPath, beforeTabId })
  }
  const content = activeTabId ? tabs[activeTabId].content : null
  return (
    <div ref={rootRef} className={clsx({ 'pf-tab-view': true })} style={style}>
      <SplitResizeHandle direction={direction} onResize={onResize} />
      <div className={clsx({ 'pf-drop-zone': true, 'pf-highlight': collected.fromExternalView })} />
      <div ref={drop} className={clsx({ 'pf-tab-view__tabs': true, 'pf-hidden': Object.keys(tabs).length === 0 })}>
        <div className="pf-tab-title-list">
          {Object.entries(tabs).map(([id, tab]) => (
            <Tab
              id={id}
              path={currentPath}
              className="pf-tab-view__tab-title"
              key={id}
              children={tab.title}
              isActive={id === activeTabId}
              onClick={onTabChange}
              onClose={onTabClose}
              onDrop={onDrop}
            />
          ))}
          <button id="add-new" className="pf-tab-view__add" key="add-new" onClick={onAddNew}>
            <IconAdd width={16} height={16} />
          </button>
        </div>
        <div className="pf-view-controls">{props.headerControls}</div>
      </div>
      <div className="pf-tab-view__content">
        {props.noCache ? (
          <div className="pf-tab-view__content-inner">{content}</div>
        ) : (
          tabsEntries.map(([id, tab]) => (
            <div
              key={id}
              className={clsx({
                'pf-tab-view__content-inner': true,
                'pf-hidden': id !== activeTabId
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
  onDrop?: (tabId: string, beforeTabId: string, path: string[]) => void
  className?: string
  path: string[]
}
export interface TabDraggingProps {
  id: string
  fromPath: string[]
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
