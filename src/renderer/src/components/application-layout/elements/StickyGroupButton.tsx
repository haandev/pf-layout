import React, { FC, useRef, useState } from 'react';
import IconCornerRightBottom from '../icons/IconCornerRightBottom';

import clsx from 'clsx';
import { useLongPress } from '..';
import useEvent from 'react-use-event-hook';
import { useOnClickOutside } from 'usehooks-ts';

export interface StickyGroupButtonProps {
  items: Record<
    string,
    {
      render: React.ReactNode;
      label: string;
    }
  >;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onChange?: (value: string) => void;
  onItemClick?: React.MouseEventHandler<HTMLDivElement>;
  value?: string;
}
export const StickyGroupButton: FC<StickyGroupButtonProps> = (props) => {
  const rootRef = useRef<HTMLButtonElement>(null);
  const dropDownRef = useRef<HTMLDivElement>(null);

  //choosing which item will be displayed
  const firstVisible = Object.keys(props.items)[0];
  const [lastUsed, setLastUsed] = useState<string>(firstVisible);

  const isActive = props.value && props.items[props.value];

  if (isActive && lastUsed !== props.value) setLastUsed(props.value || '');
  const current = props.items[lastUsed];

  //dropdown menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  //handling click and long press

  const onClick = useEvent((e) => {
    if (props.value !== lastUsed) {
      props.onChange?.(lastUsed);
    }
    props.onClick?.(e);
  });
  const onLongPress = useEvent((e) => {
    onClick(e);
    setIsMenuOpen(true);
  });
  const bind = useLongPress(onLongPress, onClick, {
    delay: 300,
    shouldPreventDefault: true
  });
  useOnClickOutside(dropDownRef, () => {
    setIsMenuOpen(false);
  });

  return (
    <button
      ref={rootRef}
      className={clsx({
        'pf-item-sticky-button': true,
        'pf-active': isActive
      })}
    >
      <div className="pf-item-sticky-button-render" {...(bind as any)}>
        {current.render}
      </div>

      <IconCornerRightBottom width={3} height={3} className="pf-button-corner" />
      {isMenuOpen && (
        <div ref={dropDownRef} className="pf-item-sticky-button-dropdown">
          {Object.keys(props.items).map((key) => {
            const onClick = (e) => {
              e.stopPropagation();
              if (props.value !== key) {
                props.onChange?.(key);
              }
              props.onItemClick?.(e);
              setIsMenuOpen(false);
            };
            const itemActive = key === props.value;
            return (
              <div
                key={key}
                className={clsx({
                  'pf-item-sticky-button-dropdown-item': true,
                  'pf-active': itemActive
                })}
                onClick={onClick}
                onMouseUp={onClick}
              >
                <div className="pf-item-sticky-button-dropdown-item-bullet">&#9632;</div>
                {props.items[key].render}
                <span className="pf-item-sticky-button-dropdown-item-label">{props.items[key].label}</span>
              </div>
            );
          })}
        </div>
      )}
    </button>
  );
};
