import React, { FC, PropsWithChildren, useEffect, useRef } from 'react';
import clsx from 'clsx';
import useEvent from 'react-use-event-hook';
import { useWindowSize } from 'usehooks-ts';
import { useDrag } from 'react-dnd';

import { Direction } from '../types';
import { useValidateElement, useDragDelta } from '..';
import IconXmark from '../icons/IconXmark';
import IconMinus from '../icons/IconMinus';
import IconPlus from '../icons/IconPlus';
import { UseBoxResizeHandler } from '../hooks/use-box-resize';
import ResizeBox from '../elements/ResizeBox';
import { useDropDelta } from '../hooks/use-drop-delta';

export type OnResizeHandler = (width: number, height: number, top: number, left: number, viewPath: string[]) => void;
export interface WindowProps extends PropsWithChildren {
  onWindowResize?: OnResizeHandler;
  direction?: Direction;
  floating?: boolean;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  id: string;
  path?: string[];
  zIndex?: number;
  minimized?: boolean;
  maximized?: boolean;
  onMaximize?: (viewPath: string[]) => void;
  onMinimize?: (viewPath: string[]) => void;
  onClose?: (viewPath: string[]) => void;
  onRestore?: (viewPath: string[]) => void;
}

export const Window: FC<WindowProps> = React.memo(({ path, id, ...props }) => {
  //validate parent
  const rootRef = useRef<HTMLDivElement>(null);
  useValidateElement(rootRef, { $parent: { $match: '.pf-container,.pf-view-group' } }, (validation) => {
    if (!validation) {
      throw new Error('Window must be used within a Container or another Window.');
    }
  });

  //concat path
  const currentPath = [...(path || []), id];

  //handle attached window size props while browser window resize
  const { width = 0, height = 0 } = useWindowSize();
  useEffect(() => {
    if (props.floating) return;
    const element = rootRef.current;
    if (!element) return;
    const visible = visibleDimension(element);
    props.onWindowResize?.(visible.width, visible.height, props.top || 0, props.left || 0, currentPath);
  }, [width, height, props.floating]);

  //handle resize floating window
  const resizeBoxHandler: UseBoxResizeHandler = (_e, ...args) => {
    props.onWindowResize?.(...args, currentPath);
  };

  //handle floating window move
  const moveFloatingWindowHandler = useEvent((_e, xDelta, yDelta) => {
    const element = rootRef.current;
    if (!element) return;
    const initialRect = element.getBoundingClientRect();
    props.onWindowResize?.(props.width || 0, props.height || 0, initialRect.top + yDelta, initialRect.left + xDelta, currentPath);
  });

  //handle set zIndex to the top
  const onClickAnywhere = useEvent(() => {
    props.onWindowResize?.(props.width || 0, props.height || 0, props.top || 0, props.left || 0, currentPath);
  });

  const header = useDragDelta<HTMLDivElement>({
    onDrag: moveFloatingWindowHandler,
    safetyMargins: { top: 50, left: 50, right: 50, bottom: 50 },
    type: 'window'
  });

  useDropDelta({
    ref: header,
    accepts: ['window'],
    onDrop: (e, dragSource) => {
      console.log(dragSource);
    }
  });

  //drag(header)
  const _direction = props.direction || Direction.Horizontal;
  const directionClass = _direction === Direction.Horizontal ? 'pf-horizontal' : 'pf-vertical';

  const floatingHeaderRender = () => {
    if (!props.floating) return null;
    return (
      <div ref={header} className="pf-window__header">
        <div className="pf-window__controls no-drag">
          <button
            className={clsx({ 'pf-icon pf-icon__close ': true, 'pf-icon__disabled': !props.onClose })}
            onClick={(e) => {
              e.stopPropagation();
              return props.onClose?.(currentPath);
            }}
          >
            <IconXmark width={8} height={8} />
          </button>
          <button
            className={clsx({ 'pf-icon pf-icon__minimize ': true, 'pf-icon__disabled': !props.onMinimize || props.minimized })}
            onClick={(e) => {
              e.stopPropagation();
              return props.onMinimize?.(currentPath);
            }}
          >
            <IconMinus width={8} height={8} />
          </button>

          {props.minimized || props.maximized ? (
            <button
              className={clsx({ 'pf-icon pf-icon__maximize ': true, 'pf-icon__disabled': !props.onRestore })}
              onClick={(e) => {
                e.stopPropagation();
                return props.onRestore?.(currentPath);
              }}
            >
              <IconPlus width={8} height={8} /> {/*TODO: add restore icon here */}
            </button>
          ) : (
            <button
              className={clsx({ 'pf-icon pf-icon__maximize ': true, 'pf-icon__disabled': !props.onMaximize })}
              onClick={(e) => {
                e.stopPropagation();
                return props.onMaximize?.(currentPath);
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
    top: props.floating && props.top ? `${props.top}px` : undefined,
    left: props.floating && props.left ? `${props.left}px` : undefined,
    width: props.width ? `${props.width}px` : undefined,
    height: props.height ? `${props.height}px` : undefined,
    zIndex: (props.zIndex || 0) + 300
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
