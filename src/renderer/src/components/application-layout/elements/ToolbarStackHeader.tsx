import { FC, useRef } from 'react';
import clsx from 'clsx';
import { useValidateElement } from '../hooks/use-validate-element';
import { useParentDirection } from '../hooks/use-parent-direction';
import IconChevronsRight from '../icons/IconChevronsRight';
import IconChevronsLeft from '../icons/IconChevronsLeft';
import IconChevronsUp from '../icons/IconChevronsUp';
import IconChevronsDown from '../icons/IconChevronsDown';
import { Direction } from '../types';
import IconXmark from '../icons/IconXmark';

export interface ToolbarStackHeaderProps {
  onExpand?: () => void;
  onCollapse?: () => void;
  isExpanded?: boolean;
  chevronPosition?: 'start' | 'end';
  onClose?: (stackId?: string, parentId?: string) => void;
  stackId: string;
  parentId?: string;
}
export const ToolbarStackHeader: FC<ToolbarStackHeaderProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const chevronPosition = props.chevronPosition || 'end';
  useValidateElement(rootRef, { $parent: { $match: '.pf-toolbar-stack' } }, (validation) => {
    if (!validation) {
      throw new Error('ToolbarStackHeader must be used within a ToolbarStack.');
    }
  });

  const toolbarStackDirection = useParentDirection(rootRef, '.pf-toolbar-stack');

  const isVertical = toolbarStackDirection === Direction.Vertical;

  const _left = chevronPosition === 'start' && [
    !props.isExpanded && (
      <button key="left-right" onClick={() => props.onExpand?.()}>
        {isVertical ? <IconChevronsRight width={10} height={10} /> : <IconChevronsDown width={10} height={10} />}
      </button>
    ),
    props.isExpanded && (
      <button key="left-left" onClick={() => props.onCollapse?.()}>
        {isVertical ? <IconChevronsLeft width={10} height={10} /> : <IconChevronsUp width={10} height={10} />}
      </button>
    )
  ];
  const _right = chevronPosition === 'end' && [
    !props.isExpanded && (
      <button key="right-right" onClick={() => props.onExpand?.()}>
        {isVertical ? <IconChevronsRight width={10} height={10} /> : <IconChevronsDown width={10} height={10} />}
      </button>
    ),
    props.isExpanded && (
      <button key="right-left" onClick={() => props.onCollapse?.()}>
        {isVertical ? <IconChevronsLeft width={10} height={10} /> : <IconChevronsUp width={10} height={10} />}
      </button>
    )
  ];
  const group = rootRef.current?.closest('.pf-floating-toolbar-window');
  const stack = rootRef.current?.closest('.pf-toolbar-stack');
  const isFirstChild = group?.firstElementChild === stack;

  const close = props.onClose ? (
    <button onClick={() => props.onClose?.(props.stackId, props.parentId)}>
      <IconXmark width={8} height={8} />
    </button>
  ) : null;
  return (
    <div
      ref={rootRef}
      className={clsx({
        'pf-toolbar-stack-header': true
      })}
    >
      <div className="pf-stack-header-left">
        {isFirstChild && close}
        {_left}
      </div>
      <div className="pf-stack-header-right">{_right}</div>
    </div>
  );
};
