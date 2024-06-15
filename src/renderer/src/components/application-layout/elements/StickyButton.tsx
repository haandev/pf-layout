import { FC, PropsWithChildren } from 'react';
import clsx from 'clsx';

export interface StickyButtonProps extends PropsWithChildren {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
}
export const StickyButton: FC<StickyButtonProps> = (props) => {
  const isActive = props.name === props.value;
  const onClick = (e: any) => {
    if (props.onChange && !isActive) {
      props.onChange(props.name);
    }
    if (props.onClick) {
      props.onClick(e);
    }
  };
  return (
    <button
      onClick={onClick}
      className={clsx({
        'pf-item-sticky-button': true,
        'pf-active': isActive
      })}
    >
      {props.children}
    </button>
  );
};
