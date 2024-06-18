import clsx from 'clsx';
import { FC, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { Direction, IWindow, NodeType } from '../types';
import { SceneDropTarget, SceneDroppableItems } from '../types.dnd';
import { SceneStore } from '../stores/scene-store';
import IconSplitSquareHorizontal from '../icons/IconSplitSquareHorizontal';
import { Window } from './Window';
import { NestedTabView } from './NestedTabView';
import IconSplitSquareVertical from '../icons/IconSplitSquareVertical';
import { SceneEvents } from '../types.event';
import { createPortal } from 'react-dom';
import { useResizeObserver } from 'usehooks-ts';

/*
 * Determines if a window can be detached based on its floating status and the structure of its members.
 * A window can be detached if:
 * 1. It is not floating - suggesting it's in a fixed or docked state and detachable.
 * 2. It is floating and the very first member of the first group is of type 'GroupView' - indicating a specific
 *    structural setup that supports detaching.
 * 3. It is floating and there are multiple members within the first group - allowing for individual members to be detached.
 */
const canWindowDetachable = (_win: IWindow) => true;
//!win.floating || (win.floating && win.members[0]?.members?.[0]?.type === NodeType.GroupView) || win.members[0]?.members?.length > 1;

export interface SceneProps extends SceneEvents {
  store: SceneStore;
}

export const Scene: FC<SceneProps> = ({ store, ...events }) => {
  //update contents of scene events with props events
  store.assignEvents(events);

  const rootRef = useRef<HTMLDivElement>(null);
  const [collected, drop] = useDrop<SceneDroppableItems, unknown, SceneDropTarget>(() => ({
    accept: [NodeType.Tab, NodeType.TabView],
    collect: (monitor) => {
      const item = monitor.getItem();
      const type = item?.type;
      const isOverOnlyMe = monitor.isOver({ shallow: true });
      return {
        isDroppable: isOverOnlyMe && type === NodeType.TabView
      };
    },
    drop: (item, monitor) => {
      const type = item.type;
      const isOverOnlyMe = monitor.isOver({ shallow: true });

      /*    if (!isOverOnlyMe && item.type === NodeType.TabView) {
        const detachPosition = monitor.getClientOffset();
        store.detachView?.(item.id, detachPosition?.x, detachPosition?.y);
      } */

      if (isOverOnlyMe && type === NodeType.TabView) {
        store.$tabView(item.id)?.$attach();
      }

      //
    }
  }));

  useResizeObserver({
    ref: rootRef,
    onResize: (entry) => {
      return store.events.onSceneResize?.(
        {
          width: entry.width || 0,
          height: entry.height || 0
        },
        store.members
      );
    }
  });

  drop(rootRef);

  return (
    <>
      <div ref={rootRef} className={clsx(['pf-scene'])}>
        <div className={clsx({ 'pf-drop-zone': true, 'pf-highlight': collected.isDroppable })} />
        {store.members.length > 0 &&
          store.members.map((win) => {
            const child = (
              <Window
                key={win.id}
                store={store}
                id={win.id}
                floating={win.floating}
                width={win.width}
                height={win.height}
                top={win.top}
                left={win.left}
                zIndex={win.zIndex}
                minimized={win.minimized}
                maximized={win.maximized}
              >
                <NestedTabView
                  store={store}
                  id={win.id}
                  view={win}
                  titleFormatter={(_tabView, tab) => tab.title}
                  titleEditable={true}
                  detachable={canWindowDetachable(win)}
                  attachable={!!win.floating}
                  headerControls={
                    !win.minimized
                      ? [
                          {
                            isVisible: (view) => view && view.members.length > 1,
                            render: <IconSplitSquareHorizontal width={16} height={16} />,
                            onClick: (viewId) => store.$tabView(viewId)?.$split(Direction.Horizontal)
                          },
                          {
                            isVisible: (view) => view && view.members.length > 1,
                            render: <IconSplitSquareVertical width={16} height={16} />,
                            onClick: (viewId) => store.$tabView(viewId)?.$split(Direction.Vertical)
                          }
                        ]
                      : []
                  }
                />
              </Window>
            );

            if (win.floating) return createPortal(child, document.querySelector('.pf-floating-windows') as HTMLElement);
            return child;
          })}
      </div>
      <div className="pf-floating-windows" />
    </>
  );
};
