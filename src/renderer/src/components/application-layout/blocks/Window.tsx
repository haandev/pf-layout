import React, { FC, PropsWithChildren, useEffect, useRef } from 'react';
import clsx from 'clsx';
import useEvent from 'react-use-event-hook';
import { useWindowSize } from 'usehooks-ts';

import { Direction, NodeType } from '../types';
import { useValidateElement } from '..';
import IconXmark from '../icons/IconXmark';
import IconMinus from '../icons/IconMinus';
import IconPlus from '../icons/IconPlus';
import { UseBoxResizeHandler } from '../hooks/use-box-resize';
import ResizeBox from '../elements/ResizeBox';
import { useDrag } from 'react-dnd';
import { WindowDragSource } from '../types.dnd';

export type OnResizeHandler = (width: number, height: number, top: number, left: number, id: string) => void;
export interface WindowProps extends PropsWithChildren {
  onWindowResize?: OnResizeHandler;
  direction?: Direction;
  floating?: boolean;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  id: string;
  zIndex?: number;
  minimized?: boolean;
  maximized?: boolean;
  onMaximize?: (id: string) => void;
  onMinimize?: (id: string) => void;
  onClose?: (id: string) => void;
  onRestore?: (id: string) => void;
}

export const Window: FC<WindowProps> = React.memo(({ id, ...props }) => {
  //validate parent
  const rootRef = useRef<HTMLDivElement>(null);
  useValidateElement(rootRef, { $parent: { $match: '.pf-scene,.pf-floating-windows' } }, (validation) => {
    if (!validation) {
      throw new Error('Window must be used within a Scene or floating in body.');
    }
  });

  //handle attached window size props while browser window resize
  const { width = 0, height = 0 } = useWindowSize();
  useEffect(() => {
    if (props.floating) return;
    const element = rootRef.current;
    if (!element) return;
    const visible = visibleDimension(element);
    props.onWindowResize?.(visible.width, visible.height, props.top || 0, props.left || 0, id);
  }, [width, height, props.floating]);

  //handle resize floating window
  const resizeBoxHandler: UseBoxResizeHandler = (_e, ...args) => {
    props.onWindowResize?.(...args, id);
  };

  //handle set zIndex to the top
  const onClickAnywhere = useEvent(() => {
    props.onWindowResize?.(props.width || 0, props.height || 0, props.top || 0, props.left || 0, id);
  });

  const _direction = props.direction || Direction.Horizontal;
  const directionClass = _direction === Direction.Horizontal ? 'pf-horizontal' : 'pf-vertical';

  //floating window header
  const [isDragging, header, preview] = useDrag<WindowDragSource>({
    collect: (monitor) => monitor.isDragging(),
    type: NodeType.Window,
    item: {
      type: NodeType.Window,
      id
    }
  });
  preview(rootRef);
  const onHeaderDoubleClick = useEvent(() => {
    if (props.maximized) {
      props.onRestore?.(id);
    } else props.onMaximize?.(id);
  });
  const floatingHeaderRender = () => {
    if (!props.floating) return null;
    return (
      <div ref={header} className="pf-window__header" onDoubleClick={onHeaderDoubleClick}>
        <div className="pf-window__controls no-drag">
          <button
            className={clsx({ 'pf-icon pf-icon__close ': true, 'pf-icon__disabled': !props.onClose })}
            onClick={(e) => {
              e.stopPropagation();
              return props.onClose?.(id);
            }}
          >
            <IconXmark width={8} height={8} />
          </button>
          <button
            className={clsx({ 'pf-icon pf-icon__minimize ': true, 'pf-icon__disabled': !props.onMinimize || props.minimized })}
            onClick={(e) => {
              e.stopPropagation();
              return props.onMinimize?.(id);
            }}
          >
            <IconMinus width={8} height={8} />
          </button>

          {props.minimized || props.maximized ? (
            <button
              className={clsx({ 'pf-icon pf-icon__maximize ': true, 'pf-icon__disabled': !props.onRestore })}
              onClick={(e) => {
                e.stopPropagation();
                return props.onRestore?.(id);
              }}
            >
              <IconPlus width={8} height={8} /> {/*TODO: add restore icon here */}
            </button>
          ) : (
            <button
              className={clsx({ 'pf-icon pf-icon__maximize ': true, 'pf-icon__disabled': !props.onMaximize })}
              onClick={(e) => {
                e.stopPropagation();
                return props.onMaximize?.(id);
              }}
            >
              <IconPlus width={8} height={8} />
            </button>
          )}
        </div>
        <span></span>
      </div>
    );
  };

  const styleFloating: React.CSSProperties = {
    top: props.floating && props.top !== undefined ? `${props.top}px` : undefined,
    left: props.floating && props.left !== undefined ? `${props.left}px` : undefined,
    width: props.width ? `${props.width}px` : undefined,
    height: props.height ? `${props.height}px` : undefined,
    zIndex: (props.zIndex || 0) + 300,
    opacity: isDragging ? 0 : 1
  };

  const styleAttached: React.CSSProperties = {
    width: props.width ? `${props.width}px` : undefined,
    minHeight: props.height ? `${props.height}px` : undefined
  };

  return (
    <div
      onClick={onClickAnywhere}
      ref={rootRef}
      className={clsx({
        'pf-window': true,
        'pf-floating': props.floating,
        'pf-attached': !props.floating,
        'pf-minimized': props.minimized
      })}
      style={props.floating ? styleFloating : styleAttached}
    >
      <div className="pf-window__inside">
        {floatingHeaderRender()}

        {props.floating && !props.minimized && (
          <ResizeBox ref={rootRef} handler={resizeBoxHandler} safetyMargins={{ top: 50, left: 50, right: 50, bottom: 50 }} />
        )}

        <div
          className={clsx({
            'pf-window__content': true,
            [directionClass]: true
          })}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
});

const calculateVisibleDimension = (totalSize, position, clientSize) => {
  const endPosition = position + totalSize;
  if (endPosition > clientSize) {
    return Math.max(0, clientSize - position);
  }
  return totalSize;
};
const visibleDimension = (element) => {
  const rect = element.getBoundingClientRect();
  const clientWidth = document.documentElement.clientWidth;
  const clientHeight = document.documentElement.clientHeight;
  const width = calculateVisibleDimension(rect.width, rect.left, clientWidth);
  const height = calculateVisibleDimension(rect.height, rect.top, clientHeight);
  return { width, height };
};
