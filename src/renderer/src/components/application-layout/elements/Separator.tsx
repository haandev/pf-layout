import { FC, useRef } from 'react';

import { useParentDirection, useValidateElement } from '..';
import { Direction } from '../types';

import IconLine from '../icons/IconLine';
import IconVerticalLine from '../icons/IconVerticalLine';

export const Separator: FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useValidateElement(rootRef, { $parent: { $match: '.pf-toolbar-items' } }, (validation) => {
    if (!validation) {
      throw new Error('Separator must be used within a Toolbar.');
    }
  });

  const toolbarDirection = useParentDirection(rootRef, '.pf-toolbar');

  return (
    <div className="pf-item-separator" ref={rootRef}>
      {toolbarDirection === Direction.Horizontal && <IconVerticalLine height={20} width={20} />}
      {toolbarDirection === Direction.Vertical && <IconLine height={20} width={20} />}
    </div>
  );
};
