import React, { FC, PropsWithChildren, startTransition, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import useEvent from 'react-use-event-hook';
import { useWindowSize } from 'usehooks-ts';

import { ResizeBox } from '../../elements';

import { SceneStore } from '../../stores/scene-store';

import { AsComponentProps, Direction, IWindow } from '../../types';
import { useDragDelta, useValidateElement } from '../../hooks';
import { UseBoxResizeHandler } from '../../hooks/use-box-resize';

import IconXmark from '../../icons/IconXmark';
import IconMinus from '../../icons/IconMinus';
import IconPlus from '../../icons/IconPlus';

export interface WindowProps extends PropsWithChildren, AsComponentProps<IWindow> {
  store: SceneStore;
  direction?: Direction;
}

export const Window: FC<WindowProps> = React.memo(({ id, store, ...props }) => {
  const [windowInstance] = useState(store.$window(id)); // no setter, just stable reference

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
    windowInstance?.$resize(visible.width, visible.height, props.top || 0, props.left || 0);
  }, [width, height, props.floating]);

  //handle resize floating window
  const resizeBoxHandler: UseBoxResizeHandler = (_e, ...args) => {
    windowInstance?.$resize(...args);
  };

  //handle floating window move
  const moveFloatingWindowHandler = useEvent((_e, xDelta, yDelta) => {
    const element = rootRef.current;
    if (!element) return;
    startTransition(() => windowInstance?.$move(xDelta, yDelta));
  });

  //handle set zIndex to the top
  const onClickAnywhere = useEvent(() => {
    windowInstance?.$bringToFront();
  });

  const header = useDragDelta<HTMLDivElement>({
    onDrag: moveFloatingWindowHandler,
    safetyMargins: { top: 1, left: 1, right: 1, bottom: 1 },
    type: 'window'
  });

  //drag(header)
  const _direction = props.direction || Direction.Horizontal;
  const directionClass = _direction === Direction.Horizontal ? 'pf-horizontal' : 'pf-vertical';

  //floating window header

  const onHeaderDoubleClick = useEvent(() => {
    if (props.maximized) {
      windowInstance?.$restore();
    } else windowInstance?.$maximize();
  });
  const floatingHeaderRender = () => {
    if (!props.floating) return null;
    return (
      <div ref={header} className="pf-window__header" onDoubleClick={onHeaderDoubleClick}>
        <div className="pf-window__controls no-drag">
          <button
            className={clsx({ 'pf-icon pf-icon__close ': true })}
            onClick={(e) => {
              e.stopPropagation();
              return windowInstance?.$close();
            }}
          >
            <IconXmark width={8} height={8} />
          </button>
          <button
            className={clsx({ 'pf-icon pf-icon__minimize ': true, 'pf-icon__disabled': props.minimized })}
            onClick={(e) => {
              e.stopPropagation();
              return windowInstance?.$minimize();
            }}
          >
            <IconMinus width={8} height={8} />
          </button>

          {props.minimized || props.maximized ? (
            <button
              className={clsx({ 'pf-icon pf-icon__maximize ': true })}
              onClick={(e) => {
                e.stopPropagation();
                return windowInstance?.$restore();
              }}
            >
              <IconPlus width={8} height={8} /> {/*TODO: add restore icon here */}
            </button>
          ) : (
            <button
              className={clsx({ 'pf-icon pf-icon__maximize ': true })}
              onClick={(e) => {
                e.stopPropagation();
                return windowInstance?.$maximize();
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
          <ResizeBox
            ref={rootRef}
            handler={resizeBoxHandler}
            safetyMargins={{ top: 50, left: 50, right: 50, bottom: 50 }}
          />
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

const calculateVisibleDimension = (totalSize: number, position: number, clientSize: number) => {
  const endPosition = position + totalSize;
  if (endPosition > clientSize) {
    return Math.max(0, clientSize - position);
  }
  return totalSize;
};
const visibleDimension = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const clientWidth = document.documentElement.clientWidth;
  const clientHeight = document.documentElement.clientHeight;
  const width = calculateVisibleDimension(rect.width, rect.left, clientWidth);
  const height = calculateVisibleDimension(rect.height, rect.top, clientHeight);
  return { width, height };
};
