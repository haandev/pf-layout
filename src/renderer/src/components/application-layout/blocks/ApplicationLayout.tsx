import '../styles/main.css';

import clsx from 'clsx';
import { FC, PropsWithChildren, useEffect, useRef } from 'react';
import { Direction, NodeType } from '../types';
import { LayoutDropTarget, LayoutDroppableItems } from '../types.dnd';
import { useDrop } from 'react-dnd';
import { LayoutStore } from '../stores/layout-store';

export interface ApplicationLayoutProps extends PropsWithChildren {
  home?: false | null | React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  direction?: Direction;
  store: LayoutStore;
}
export const ApplicationLayout: FC<ApplicationLayoutProps> = ({ store, home, style, className, direction, children }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  console.log(store.members);
  const _direction = direction || Direction.Vertical;

  const [collected, drop] = useDrop<LayoutDroppableItems, unknown, LayoutDropTarget>(() => ({
    accept: [NodeType.ToolbarStackGroup],

    drop: (item, monitor) => {
      const isOverOnlyMe = monitor.isOver({ shallow: true });

      if (isOverOnlyMe) {
        const delta = monitor.getDifferenceFromInitialOffset() || { x: 0, y: 0 };
        store.moveToolbarStackGroup(item.id, delta.x, delta.y);
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
      </div>
    </>
  );
};
