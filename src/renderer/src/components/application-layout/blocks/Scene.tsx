import clsx from 'clsx';
import { FC, useRef } from 'react';
import { useValidateElement } from '../hooks/use-validate-element';
import { useDrop } from 'react-dnd';
import { Direction, IWindow, NodeType } from '../types';
import { SceneDropTarget, SceneDroppableItems } from '../dnd.types';
import { SceneStore } from '../stores/scene-store';
import IconSplitSquareHorizontal from '../icons/IconSplitSquareHorizontal';
import { Window } from './Window';
import { NestedTabView } from './NestedTabView';
import IconSplitSquareVertical from '../icons/IconSplitSquareVertical';
import IconWindowStack from '../icons/IconWindowStack';
import IconLayout from '../icons/IconLayout';
import { SceneEvents } from '../event.types';
import { useInitialize } from '../hooks/use-initialize';

/*
 * Determines if a window can be detached based on its floating status and the structure of its members.
 * A window can be detached if:
 * 1. It is not floating - suggesting it's in a fixed or docked state and detachable.
 * 2. It is floating and the very first member of the first group is of type 'GroupView' - indicating a specific
 *    structural setup that supports detaching.
 * 3. It is floating and there are multiple members within the first group - allowing for individual members to be detached.
 */
const canWindowDetachable = (win: IWindow) =>
  !win.floating || (win.floating && win.members[0]?.members?.[0]?.type === NodeType.GroupView) || win.members[0]?.members?.length > 1;

export interface SceneProps extends SceneEvents {
  store: SceneStore;
  newTabContent: () => JSX.Element;
}

export const Scene: FC<SceneProps> = ({ store, newTabContent, ...events }) => {

  //update contents of scene events with props events
  Object.assign(store.events, events);

  const rootRef = useRef<HTMLDivElement>(null);

  //validate nesting order
  useValidateElement(rootRef, { $parent: { $match: '.pf-container' } }, (validation) => {
    if (!validation) {
      throw new Error('Scene must be used within a Container.');
    }
  });

  const [collected, drop] = useDrop<SceneDroppableItems, unknown, SceneDropTarget>(() => ({
    accept: [NodeType.Tab, NodeType.TabView],
    collect: (monitor) => {
      const isOverOnlyMe = monitor.isOver({ shallow: true });
      const item = monitor.getItem();
      return {
        isDroppable: isOverOnlyMe && item.type === NodeType.TabView
      };
    },
    drop: (item, monitor) => {
      const isOverOnlyMe = monitor.isOver({ shallow: true });

      if (!isOverOnlyMe && item.type === NodeType.TabView) {
        store.detachView?.(item.id);
      }

      if (isOverOnlyMe && item.type === NodeType.TabView) {
        store.attachView?.(item.id);
      }

      //
    }
  }));
  drop(rootRef);

  return (
    <div ref={rootRef} className={clsx(['pf-scene'])}>
      <div className={clsx({ 'pf-drop-zone': true, 'pf-highlight': collected.isDroppable })} />
      {store.members.length > 0 &&
        store.members.map((win) => (
          <Window
            id={win.id}
            floating={win.floating}
            key={win.id}
            width={win.width}
            height={win.height}
            top={win.top}
            left={win.left}
            onWindowResize={store.resizeWindow}
            zIndex={win.zIndex}
            minimized={win.minimized}
            maximized={win.maximized}
            onMaximize={store.maximizeWindow}
            onMinimize={store.minimizeWindow}
            onRestore={store.restoreWindowSize}
            onClose={store.closeWindow}
          >
            <NestedTabView
              id={win.id}
              view={win}
              titleFormatter={(_tabView, tab) => tab.title}
              titleEditable={true}
              onTabChange={store.changeTab}
              onTabClose={store.closeTab}
              onTabMove={store.moveTab}
              onResize={store.resizeView}
              onAddNewClick={
                !win.minimized
                  ? (viewId) => {
                      const content = newTabContent();
                      store.addTab(viewId, { content, recentlyCreated: true });
                    }
                  : undefined
              }
              detachable={canWindowDetachable(win)}
              attachable={!!win.floating}
              onDetach={store.detachView}
              onAttach={store.attachView}
              headerControls={
                !win.minimized
                  ? [
                      {
                        isVisible: (view) => view && view.members.length > 1,
                        render: <IconSplitSquareHorizontal width={16} height={16} />,
                        onClick: (viewId) => store.splitTabView(viewId, Direction.Horizontal)
                      },
                      {
                        isVisible: (view) => view && view.members.length > 1,
                        render: <IconSplitSquareVertical width={16} height={16} />,
                        onClick: (viewId) => store.splitTabView(viewId, Direction.Vertical)
                      },
                      {
                        isVisible: () => !win.floating,
                        render: <IconWindowStack width={16} height={16} />,
                        onClick: (viewId) => store.detachView(viewId)
                      },
                      {
                        isVisible: () => !!win.floating,
                        render: <IconLayout width={16} height={16} />,
                        onClick: (viewId) => store.attachView(viewId)
                      }
                    ]
                  : []
              }
            />
          </Window>
        ))}
    </div>
  );
};
