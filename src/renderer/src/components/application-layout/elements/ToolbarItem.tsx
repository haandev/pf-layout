import { FC, PropsWithChildren, useRef } from 'react';
import { useValidateElement } from '../hooks/use-validate-element';

export interface ToolbarItemProps extends PropsWithChildren {}
export const ToolbarItem: FC<ToolbarItemProps> = ({ children }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useValidateElement(rootRef, { $parent: { $match: '.pf-toolbar-items' } }, (validation) => {
    if (!validation) {
      throw new Error('ToolbarItem must be used within a Toolbar.');
    }
  });
  return <div className="pf-toolbar-item">{children}</div>;
};
