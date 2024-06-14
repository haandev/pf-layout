import clsx from 'clsx';
import { useDrag, useDrop } from 'react-dnd';

import React, { CSSProperties, FC, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useParentDirection, useValidateElement, SplitResizeHandle } from '..';
import { Direction, ITab, ITabView, NodeType } from '../types';

import IconXmark from '../icons/IconXmark';
import IconAdd from '../icons/IconAdd';
import { evalBoolean, lookUp } from '../util';
import useEvent from 'react-use-event-hook';
import { TabDragSource, TabDropTarget, TabDroppableItems, TabViewDropTarget, TabViewDroppableItems } from '../dnd.types';

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
  onAddNewClick?: OnAddNewClickHandler;
  onResize?: OnSplitResizeHandler;
  onTabChange?: OnTabChangeHandler;
  onTabClose?: OnTabCloseHandler;
  onTabMove?: OnTabMoveHandler;
  titleFormatter?: (tabView: ITabView, tab: ITab) => React.ReactNode;
  titleEditable?: boolean | ((tabView: ITabView, tab: ITab) => boolean);
  detachable: boolean | ((tabView: ITabView) => boolean);
  attachable: boolean | ((tabView: ITabView) => boolean);
  onDetach?: (tabViewId: string) => void;
  onAttach?: (tabViewId: string) => void;
}
export interface TabViewProps extends TabViewCommonProps, Omit<ITabView, 'type'> {
  //don't call directly, used for recursion
  activeTabId?: string;
  headerControls?: React.ReactNode;
  noCache?: boolean;
}

const TabView: FC<TabViewProps> = ({ members, titleFormatter, activeTabId, id, width, height, detachable, attachable, ...props }) => {
  const view: ITabView = { type: NodeType.TabView, members, id, activeTabId, width, height };

  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  useValidateElement(rootRef, { $parent: { $match: '.pf-view-group' } }, (validation) => {
    if (!validation) {
      throw new Error('TabView must be used within a ViewGroup.');
    }
  });

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
    console.log('resize fired', direction, size, id, nextItemSize);
    props.onResize?.(direction, size, id, nextItemSize);
  };

  const [collected, drop] = useDrop<TabViewDroppableItems, any, TabViewDropTarget>(() => ({
    accept: [NodeType.Tab, NodeType.TabView],
    collect: (monitor) => {
      const isOverOnlyMe = monitor.isOver({ shallow: true });
      const isOverMe = monitor.isOver();
      const item = monitor.getItem();

      const isInsertingTabTabSourceFromExternalView = isOverMe && item.type === NodeType.Tab && item.tabViewId !== id;

      return {
        isInsertable: isOverOnlyMe && item.id !== id,
        isDroppable: isInsertingTabTabSourceFromExternalView
      };
    },
    drop: (item, monitor) => {
      //tab from somewhere else, not dropped on a tab
      if (!monitor.didDrop() && item.type === NodeType.Tab) {
        props.onTabMove?.({ tabId: item.id, toViewId: id });
      }
    }
  }));

  const [collectedOnContentSection, dropContent] = useDrop<TabViewDroppableItems, any, TabViewDropTarget>(() => ({
    accept: [NodeType.Tab, NodeType.TabView],
    collect: (monitor) => {
      const isOverOnlyMe = monitor.isOver({ shallow: true });
      const item = monitor.getItem();
      return {
        isDroppable: isOverOnlyMe && item.type === NodeType.Tab && item.tabViewId !== id
      };
    },
    drop: (item, monitor) => {
      //tab from somewhere else, not dropped on a tab
      if (!monitor.didDrop() && item.type === NodeType.Tab) {
        props.onTabMove?.({ tabId: item.id, toViewId: id });
      }

      //self window detach
      if (item.type === NodeType.TabView && item.id === id && detachable) {
        props.onDetach?.(view.id);
      }
    }
  }));

  const [isDragging, drag, preview] = useDrag({
    type: NodeType.TabView,
    canDrag: () => detachable && evalBoolean(detachable, view),
    collect: (monitor) => monitor.isDragging(),
    item: {
      type: NodeType.TabView,
      id: id
    }
  });

  drop(rootRef);
  drag(headerRef);
  preview(rootRef);

  const onDrop = (tabId: string, beforeTabId: string) => {
    props.onTabMove?.({ tabId, toViewId: id, beforeTabId });
  };
  const content = lookUp<ITab>(members, activeTabId)?.item?.content;
  const style: CSSProperties = { width, height, minWidth: width, minHeight: height, opacity: isDragging ? '0' : '1' };

  return (
    <div ref={rootRef} className={clsx({ 'pf-tab-view': true })} style={style}>
      <SplitResizeHandle direction={direction} onResize={onResize} />
      <div className={clsx({ 'pf-drop-zone': true, 'pf-highlight': collectedOnContentSection.isDroppable })} />
      <div ref={headerRef} className={clsx({ 'pf-tab-view__tabs': true, 'pf-hidden': Object.keys(members).length === 0 })}>
        <div className="pf-tab-title-list">
          {members.map((tab, index) => (
            <Tab
              id={tab.id}
              prevTabId={members[index - 1]?.id}
              tabViewId={id}
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
          {collected.isInsertable && <div className="pf-insert-zone"></div>}
          {props.onAddNewClick && (
            <button id="add-new" className="pf-tab-view__add" key="add-new" onClick={onAddNew}>
              <IconAdd width={16} height={16} />
            </button>
          )}
        </div>
        {props.headerControls && <div className="pf-view-controls">{props.headerControls}</div>}
      </div>
      <div ref={dropContent} className="pf-tab-view__content">
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
  prevTabId?: string;
  isActive?: boolean;
  isEditable?: boolean;
  onClick?: (tabId: string) => void;
  onClose?: (tabId: string) => void;
  onDrop?: (tabId: string, beforeTabId: string) => void;
  tabViewId: string;
  title: string;
}

const Tab: FC<TabProps> = ({ id, title, tabViewId, onDrop, ...props }) => {
  const ref = useRef(null);

  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const [, drag] = useDrag<TabDragSource>(() => ({
    type: NodeType.Tab,
    item: {
      type: NodeType.Tab,
      id,
      tabViewId
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging() && monitor.getItem().id === id
    })
  }));

  const [collected, drop] = useDrop<TabDroppableItems, unknown, TabDropTarget>(() => ({
    accept: [NodeType.Tab, NodeType.TabView],
    collect: (monitor) => {
      const item = monitor.getItem();
      return {
        isInserting: monitor.isOver() && item.type === NodeType.Tab
      };
    },
    drop: (item) => {
      console.log(item, props.prevTabId, id);
      onDrop?.(item.id, id);
    }
  }));

  const className = clsx({ 'pf-tab': true, 'pf-tab-active': props.isActive, [props.className || '']: true });
  const onClose = (e) => {
    e.stopPropagation();
    props.onClose?.(id);
  };
  const onClick = () => {
    props.onClick?.(id);
  };

  const onDoubleClick = useEvent(() => {
    if (props.isEditable) {
      setEditing(true);
      setNewTitle(title);
    }
  });

  const onBlur = useEvent(() => {
    setEditing(false);
  });

  drag(drop(ref));
  return (
    <>
      {collected.isInserting && <div className="pf-insert-zone"></div>}
      <div ref={ref} onClick={onClick} className={className} onDoubleClick={onDoubleClick}>
        {props.onClose && !editing && (
          <button className="pf-tab__close" onClick={onClose}>
            <IconXmark width={10} height={10} />
          </button>
        )}
        {!editing ? props.children : <input autoFocus defaultValue={title} onBlur={onBlur} onChange={(e) => setNewTitle(e.currentTarget.value)} />}
      </div>
    </>
  );
};

export default TabView;
