import '../styles/main.css';

import clsx from 'clsx';
import { FC, PropsWithChildren, useRef } from 'react';
import { Direction, NodeType } from '../types';
import { LayoutDropTarget, LayoutDroppableItems } from '../types.dnd';
import { useDrop } from 'react-dnd';
import { LayoutStore } from '../stores/layout-store';
import { ToolbarWindow, ToolbarWindowProps } from './ToolbarWindow';

export interface ApplicationLayoutProps extends PropsWithChildren {
  home?: false | null | React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  direction?: Direction;
  store: LayoutStore;
}
export const ApplicationLayout: FC<ApplicationLayoutProps> = ({
  store,
  home,
  style,
  className,
  direction,
  children
}) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const _direction = direction || Direction.Vertical;

  const [_collected, drop] = useDrop<LayoutDroppableItems, unknown, LayoutDropTarget>(() => ({
    accept: [NodeType.ToolbarWindow, NodeType.Stack],

    drop: (item, monitor) => {
      const type = item.type;
      const didDrop = monitor.didDrop();

      if (!didDrop && type === NodeType.ToolbarWindow) {
        const delta = monitor.getDifferenceFromInitialOffset() || { x: 0, y: 0 };
        store.$toolbarWindow(item.id)?.$move(delta.x, delta.y);
      }

      if (!didDrop && type === NodeType.Stack) {
        const client = monitor.getClientOffset() || { x: 0, y: 0 };
        const initialClient = monitor.getInitialClientOffset() || { x: 0, y: 0 };
        const offset = {
          x: initialClient.x - item.x,
          y: initialClient.y - item.y
        };
        const newPosition = {
          x: client.x - offset.x,
          y: client.y - offset.y - 3
        };
        store.$stack(item.id)?.$detach(newPosition.x, newPosition.y);
      }
    }
  }));
  drop(rootRef);
  return (
    <>
      {home && <div className="pf-app pf-home">{home}</div>}
      <div
        ref={rootRef}
        className={clsx({
          'pf-app': true,
          'pf-hidden': home,
          'pf-vertical': _direction === Direction.Vertical,
          'pf-horizontal': _direction === Direction.Horizontal,
          [className || '']: true
        })}
        style={style}
      >
        {children}
        <div className="pf-floating-toolbar-host">
          {store.floating.length > 0
            ? store.floating.map((item) => {
                return (
                  <ToolbarWindow {...(store.$toolbarWindow(item.id)?.$props as ToolbarWindowProps)} key={item.id} />
                );
              })
            : null}
        </div>
      </div>
    </>
  );
};
