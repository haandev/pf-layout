import { FC, PropsWithChildren } from 'react';
import { AsComponentProps, IPanel } from '../../types';
import { StickyButton, ToolbarItem } from '../../elements';

export interface PanelProps extends PropsWithChildren, AsComponentProps<IPanel> {
  value?: string;
  onClick?: () => void;
}
export const Panel: FC<PanelProps> = (props) => {
  return (
    <ToolbarItem>
      <StickyButton value={props.value} name={props.id} onClick={props.onClick}>
        {props.icon}
      </StickyButton>
    </ToolbarItem>
  );
};
