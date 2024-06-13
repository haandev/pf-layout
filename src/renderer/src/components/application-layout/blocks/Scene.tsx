import clsx from 'clsx';
import { FC, PropsWithChildren, useRef } from 'react';
import { useValidateElement } from '../hooks/use-validate-element';

export interface SceneProps extends PropsWithChildren {}
export const Scene: FC<SceneProps> = ({ children }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useValidateElement(rootRef, { $parent: { $match: '.pf-container' } }, (validation) => {
    if (!validation) {
      throw new Error('Scene must be used within a Container.');
    }
  });

  return (
    <div ref={rootRef} className={clsx(['pf-scene'])}>
      {children}
    </div>
  );
};
