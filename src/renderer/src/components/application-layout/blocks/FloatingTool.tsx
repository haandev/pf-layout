import React, { FC, PropsWithChildren } from 'react';
import { AsComponentProps, IFloatingTool } from '../types';
import { StickyButton } from '../elements/StickyButton';
import { ToolbarItem } from '../elements/ToolbarItem';

export interface FloatingToolProps extends PropsWithChildren, AsComponentProps<IFloatingTool> {
  value?: string;
  onClick?: () => void;
}
const FloatingTool: FC<FloatingToolProps> = (props) => {
  return (
    <ToolbarItem>
      <StickyButton value={props.value} name={props.id} onClick={props.onClick}>
        {props.icon}
      </StickyButton>
    </ToolbarItem>
  );
};

export default FloatingTool;
