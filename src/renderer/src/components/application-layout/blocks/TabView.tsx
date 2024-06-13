import clsx from 'clsx';
import { useDrag, useDrop } from 'react-dnd';

import React, { FC, PropsWithChildren, act, useEffect, useRef, useState } from 'react';
import { useParentDirection, useValidateElement, SplitResizeHandle } from '..';
import { Direction } from '../types';

import IconXmark from '../icons/IconXmark';
import IconAdd from '../icons/IconAdd';
import { ITab, ITabView, NodeType } from '@renderer/stores/app-store';
import { evalBoolean, findById } from '../util';
import useEvent from 'react-use-event-hook';

export type OnTabChangeHandler = (tabId: string) => void;
export type OnTabCloseHandler = (tabId: string) => void;
export type OnAddNewClickHandler = (viewId: string) => void;
export type OnTabMoveHandler = (options: { tabId: string; toViewId: string; beforeTabId?: string }) => void;
export type OnSplitResizeHandler = (direction: Direction, size: number, id: string, nextItemSize?: number) => void;
export type OnTitleChangeHandler = (tabId: string, newTitle: string) => void;
export type TabTitleFormatter = (tabView: ITabView, tab: ITab) => React.ReactNode;
export type TabTitleEditable = boolean | ((tabView: ITabView, tab: ITab) => boolean);
export interface TabViewCommonProps {
  direction?: Direction;
  id: string; //path member
  path?: string[];
  onAddNewClick?: OnAddNewClickHandler;
  onResize?: OnSplitResizeHandler;
  onTabChange?: OnTabChangeHandler;
  onTabClose?: OnTabCloseHandler;
  onTabMove?: OnTabMoveHandler;
  titleFormatter?: (tabView: ITabView, tab: ITab) => React.ReactNode;
  titleEditable?: boolean | ((tabView: ITabView, tab: ITab) => boolean);
}
export interface TabViewProps extends TabViewCommonProps, Omit<ITabView, 'type'> {
  //don't call directly, used for recursion
  activeTabId?: string;
  headerControls?: React.ReactNode;
  noCache?: boolean;
}
const TabView: FC<TabViewProps> = ({ members, titleFormatter, activeTabId, path, id, ...props }) => {
  const view: ITabView = {
    type: NodeType.TabView,
    members,
    id: id,
    activeTabId: activeTabId,
    width: props.width,
    height: props.height
  };

  const rootRef = useRef<HTMLDivElement>(null);
  useValidateElement(rootRef, { $parent: { $match: '.pf-view-group,.pf-window__content' } }, (validation) => {
    if (!validation) {
      throw new Error('TabView must be used within a Container.');
    }
  });
  const currentPath = [...(path || []), id];

  useEffect(() => {
    if (activeTabId === undefined && members.length > 0) {
      props.onTabChange?.(members[0].id);
    }
  }, []);

  const onTabChange = (tabId: string) => {
    if (activeTabId !== tabId) {
      props.onTabChange?.(tabId);
    }
  };

  const direction = useParentDirection(rootRef, '.pf-view-group');
  const style = {
    width: props.width,
    height: props.height,
    minWidth: props.width,
    minHeight: props.height
  };

  const onTabClose = (tabId: string) => {
    const previousTabIndex = members.findIndex(({ id }) => id === tabId) - 1;
    const nextTabIndex = members.findIndex(({ id }) => id === tabId) + 1;
    if (previousTabIndex >= 0) {
      props.onTabChange?.(members[previousTabIndex].id);
    } else if (nextTabIndex < members.length) {
      props.onTabChange?.(members[nextTabIndex].id);
    }
    props.onTabClose?.(tabId);
  };
  const onAddNew = () => {
    props.onAddNewClick?.(id);
  };

  const onResize = (size: number, nextItemSize?: number) => {
    props.onResize?.(direction, size, id, nextItemSize);
  };

  const [collected, drop] = useDrop<TabDraggingProps, any, any>(() => ({
    accept: 'tab',
    collect: (monitor) => {
      return {
        fromExternalView: monitor.isOver() && monitor.getItem()?.fromPath?.join('/') !== currentPath?.join('/')
      };
    },
    drop: (item) => {
      props.onTabMove?.({ tabId: item.id, toViewId: id });
    }
  }));

  const onDrop = (tabId: string, beforeTabId: string) => {
    props.onTabMove?.({ tabId, toViewId: id, beforeTabId });
  };
  const content = activeTabId ? findById(members, activeTabId)?.content : null;

  return (
    <div ref={rootRef} className={clsx({ 'pf-tab-view': true })} style={style}>
      <SplitResizeHandle direction={direction} onResize={onResize} />
      <div className={clsx({ 'pf-drop-zone': true, 'pf-highlight': collected.fromExternalView })} />
      <div ref={drop} className={clsx({ 'pf-tab-view__tabs': true, 'pf-hidden': Object.keys(members).length === 0 })}>
        <div className="pf-tab-title-list">
          {members.map((tab) => (
            <Tab
              id={tab.id}
              path={currentPath}
              className="pf-tab-view__tab-title"
              key={tab.id}
              children={titleFormatter ? titleFormatter(view, tab) : tab.title}
              isEditable={evalBoolean(props.titleEditable, view, tab)}
              isActive={tab.id === activeTabId}
              onClick={onTabChange}
              onClose={onTabClose}
              onDrop={onDrop}
              title={tab.title}
            />
          ))}
          {props.onAddNewClick && (
            <button id="add-new" className="pf-tab-view__add" key="add-new" onClick={onAddNew}>
              <IconAdd width={16} height={16} />
            </button>
          )}
        </div>
        {props.headerControls && <div className="pf-view-controls">{props.headerControls}</div>}
      </div>
      <div className="pf-tab-view__content">
        {props.noCache ? (
          <div className="pf-tab-view__content-inner">{content}</div>
        ) : (
          members.map((tab) => (
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
  );
};
interface TabProps extends PropsWithChildren {
  className?: string;
  id: string;
  isActive?: boolean;
  isEditable?: boolean;
  onClick?: (tabId: string) => void;
  onClose?: (tabId: string) => void;
  onDrop?: (tabId: string, beforeTabId: string, path: string[]) => void;
  path: string[];
  title: string;
}
export interface TabDraggingProps {
  id: string;
  fromPath: string[];
}
const Tab: FC<TabProps> = (props) => {
  const ref = useRef(null);

  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(props.title);
  const [collect, drag] = useDrag<TabDraggingProps>(() => ({
    type: 'tab',
    item: { id: props.id, fromPath: props.path },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));
  const [, drop] = useDrop<TabDraggingProps>(() => ({
    accept: 'tab',
    hover: (item) => {
      props.onDrop?.(item.id, props.id, props.path);
    }
  }));
  const className = clsx({ 'pf-tab': true, 'pf-tab-active': props.isActive, 'pf-tab-is-dragging': collect.isDragging, [props.className || '']: true });
  const onClose = (e) => {
    e.stopPropagation();
    props.onClose?.(props.id);
  };
  const onClick = () => {
    props.onClick?.(props.id);
  };

  const onDoubleClick = useEvent(() => {
    if (props.isEditable) {
      setEditing(true);
      setNewTitle(props.title);
    }
  });

  const onBlur = useEvent(() => {
    setEditing(false);
  });

  drag(drop(ref));
  return (
    <div ref={ref} onClick={onClick} className={className} onDoubleClick={onDoubleClick}>
      {props.onClose && !editing && (
        <button className="pf-tab__close" onClick={onClose}>
          <IconXmark width={10} height={10} />
        </button>
      )}
      {!editing ? props.children : <input autoFocus defaultValue={props.title} onBlur={onBlur} onChange={(e) => setNewTitle(e.currentTarget.value)} />}
    </div>
  );
};

export default TabView;
