import '../styles/main.css';

import clsx from 'clsx';
import { FC, PropsWithChildren } from 'react';
import { Direction } from '../types';

export interface ApplicationLayoutProps extends PropsWithChildren {
  home?: false | null | React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  direction?: Direction;
}
export const ApplicationLayout: FC<ApplicationLayoutProps> = ({ home, style, className, direction, children }) => {
  const _direction = direction || Direction.Vertical;

  return (
    <>
      {home && <div className="pf-app pf-home">{home}</div>}
      <div
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
        <div className="pf-floating-windows" />
      </div>
    </>
  );
};
