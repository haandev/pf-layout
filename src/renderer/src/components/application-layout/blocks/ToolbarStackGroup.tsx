import { FC, PropsWithChildren, cloneElement, useRef } from 'react';
import { useValidateElement } from '../hooks/use-validate-element';
import clsx from 'clsx';

export interface ToolbarStackGroupProps extends PropsWithChildren {
  onClose?: () => void;
}

export const ToolbarStackGroup: FC<ToolbarStackGroupProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useValidateElement(rootRef, { $parent: { $match: '.pf-container' } }, (validation) => {
    if (!validation) {
      throw new Error('ToolbarStackGroup must be used within a Container.');
    }
  });

  const firstChild = Array.isArray(props.children) ? props.children[0] : props.children;
  const firstChildWithProps = firstChild && !firstChild.props.onClose ? cloneElement(firstChild, { onClose: props.onClose }) : firstChild;
  const [, ...rest] = Array.isArray(props.children) ? props.children : [props.children];

  return (
    <div
      ref={rootRef}
      className={clsx({
        'pf-toolbar-stack-group': true
      })}
    >
      {firstChildWithProps}
      {rest}
    </div>
  );
};
