import clsx from 'clsx';
import { FC, PropsWithChildren } from 'react';

export interface RowProps extends PropsWithChildren {
  className?: string;
  style?: React.CSSProperties;
  fullWidth?: boolean;
  fullHeight?: boolean;
}

const Row: FC<RowProps> = (props) => {
  return (
    <div
      className={clsx({
        'pf-row pf-horizontal': true,
        'pf-full-width': props.fullWidth,
        'pf-full-height': props.fullHeight,
        [props.className || '']: true
      })}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

export default Row;
