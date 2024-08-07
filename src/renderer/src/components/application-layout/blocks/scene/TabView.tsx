import clsx from 'clsx';
import { useDrag, useDrop } from 'react-dnd';
import React, { CSSProperties, FC, PropsWithChildren, useEffect, useRef, useState } from 'react';

import { evalBoolean, lookUp } from '../../utils';
import { AsComponentProps, Direction, ITab, ITabView, NodeType } from '../../types';

import IconXmark from '../../icons/IconXmark';
import IconAdd from '../../icons/IconAdd';
import useEvent from 'react-use-event-hook';
import {
  TabDragSource,
  TabDropTarget,
  TabDroppableItems,
  TabViewDragSource,
  TabViewDropTarget,
  TabViewDroppableItems
} from '../../types.dnd';
import { SceneStore } from '../../stores/scene-store';

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
  titleFormatter?: (tabView: ITabView, tab: ITab) => React.ReactNode;
  titleEditable?: boolean | ((tabView: ITabView, tab: ITab) => boolean);
  detachable: boolean | ((tabView: ITabView) => boolean);
  attachable: boolean | ((tabView: ITabView) => boolean);
}
export interface TabViewProps extends TabViewCommonProps, AsComponentProps<ITabView> {
  store: SceneStore;
  activeTabId?: string;
  headerControls?: React.ReactNode;
  noCache?: boolean;
}

export const TabView: FC<TabViewProps> = ({
  store,
  members,
  titleFormatter,
  activeTabId,
  id,
  width,
  height,
  detachable,
  attachable,
  ...props
}) => {
  const [tabViewInstance] = useState(store.$tabView(id));
  const view: ITabView = { type: NodeType.TabView, members: members || [], id, activeTabId, width, height };

  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (activeTabId === undefined && view.members.length > 0) {
      tabViewInstance?.$changeActiveTab(view.members[0].id);
    }
  }, []);

  const onTabChange = (tabId: string) => {
    if (activeTabId !== tabId) {
      tabViewInstance?.$changeActiveTab(tabId);
    }
  };

  const onTabClose = (tabId: string) => {
    const previousTabIndex = view.members.findIndex(({ id }) => id === tabId) - 1;
    const nextTabIndex = view.members.findIndex(({ id }) => id === tabId) + 1;
    if (previousTabIndex >= 0) {
      tabViewInstance?.$changeActiveTab(view.members[previousTabIndex].id);
    } else if (nextTabIndex < view.members.length) {
      tabViewInstance?.$changeActiveTab(view.members[nextTabIndex].id);
    }
    tabViewInstance?.$closeTab(tabId);
  };
  const onAddNew = () => {
    tabViewInstance?.$addTab({ recentlyCreated: true });
  };
/*
  const onResize = (size: number, nextItemSize?: number) => {
    store.resizeView(direction, size, id, nextItemSize);
  }; */

  const [collected, drop] = useDrop<TabViewDroppableItems, any, TabViewDropTarget>(() => ({
    accept: [NodeType.Tab, NodeType.TabView],
    collect: (monitor) => {
      const isOverOnlyMe = monitor.isOver({ shallow: true });
      const isOverMe = monitor.isOver();
      const item = monitor.getItem();
      const type = item?.type;

      const isInsertingTabTabSourceFromExternalView = isOverMe && type === NodeType.Tab && item.tabViewId !== id;

      return {
        isInsertable: isOverOnlyMe && item.id !== id,
        isDroppable: isInsertingTabTabSourceFromExternalView
      };
    },
    drop: (item, monitor) => {
      const type = item.type;
      //tab from somewhere else, not dropped on a tab
      if (!monitor.didDrop() && type === NodeType.Tab) {
        tabViewInstance?.$moveTabToView(item.id, id);
      }
    }
  }));

  const [collectedOnContentSection, dropContent] = useDrop<TabViewDroppableItems, any, TabViewDropTarget>(() => ({
    accept: [NodeType.Tab, NodeType.TabView],
    collect: (monitor) => {
      const isOverOnlyMe = monitor.isOver({ shallow: true });
      const item = monitor.getItem();
      return {
        isDroppable: isOverOnlyMe && item?.type === NodeType.Tab && item.tabViewId !== id
      };
    },
    drop: (item, monitor) => {
      //tab from somewhere else, not dropped on a tab
      if (!monitor.didDrop() && item.type === NodeType.Tab) {
        tabViewInstance?.$moveTabToView(item.id, id);
      }

      //self window detach
      if (item.type === NodeType.TabView && item.id === id && detachable) {
        const client = monitor.getClientOffset() || { x: 0, y: 0 };
        const initialClient = monitor.getInitialClientOffset() || { x: 0, y: 0 };
        const offset = {
          x: initialClient.x - item.x,
          y: initialClient.y - item.y
        };
        const newPosition = {
          x: client.x - offset.x,
          y: client.y - offset.y - 25
        };
        tabViewInstance?.$detach(newPosition.x, newPosition.y);
      }

      //TODO:implement merge tab views on drop header
    }
  }));

  const [isDragging, drag, preview] = useDrag<TabViewDragSource>({
    type: NodeType.TabView,
    canDrag: () => detachable && evalBoolean(detachable, view),
    collect: (monitor) => monitor.isDragging(),
    item: () => {
      return {
        type: NodeType.TabView,
        id: id,
        x: rootRef.current?.getBoundingClientRect().x || 0,
        y: rootRef.current?.getBoundingClientRect().y || 0
      };
    }
  });

  drop(rootRef);
  drag(headerRef);
  preview(rootRef);

  const onDrop = (tabId: string, beforeTabId: string) => {
    tabViewInstance?.$moveTabToView(tabId, beforeTabId);
  };
  const content = lookUp<ITab>(view.members, activeTabId)?.item?.content;
  const style: CSSProperties = { width, height, minWidth: width, minHeight: height };

  return (
    <div ref={rootRef} className={clsx({ 'pf-tab-view': true, 'pf-transparent': isDragging })} style={style}>
      <div className={clsx({ 'pf-drop-zone': true, 'pf-highlight': collectedOnContentSection.isDroppable })} />
      <div
        ref={headerRef}
        className={clsx({ 'pf-tab-view__tabs': true, 'pf-hidden': Object.keys(view.members).length === 0 })}
      >
        <div className="pf-tab-title-list">
          {view.members.map((tab, index) => (
            <Tab
              id={tab.id}
              prevTabId={view.members[index - 1]?.id}
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
          {
            <button id="add-new" className="pf-tab-view__add" key="add-new" onClick={onAddNew}>
              <IconAdd width={16} height={16} />
            </button>
          }
        </div>
        {props.headerControls && <div className="pf-view-controls">{props.headerControls}</div>}
      </div>
      <div ref={dropContent} className="pf-tab-view__content">
        {props.noCache ? (
          <div className="pf-tab-view__content-inner">{content}</div>
        ) : (
          view.members.map((tab) => (
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
  const [_newTitle, setNewTitle] = useState(title);

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
        isInserting: monitor.isOver() && item?.type === NodeType.Tab
      };
    },
    drop: (item) => {
      if (item.type === NodeType.Tab) {
        onDrop?.(item.id, id);
      }
      //TODO:implement merge tab views on drop header
    }
  }));

  const className = clsx({ 'pf-tab': true, 'pf-tab-active': props.isActive, [props.className || '']: true });
  const onClose: React.MouseEventHandler<HTMLButtonElement> = (e) => {
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
        {!editing ? (
          props.children
        ) : (
          <input autoFocus defaultValue={title} onBlur={onBlur} onChange={(e) => setNewTitle(e.currentTarget.value)} />
        )}
      </div>
    </>
  );
};
