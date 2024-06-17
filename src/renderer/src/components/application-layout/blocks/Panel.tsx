import { FC, PropsWithChildren } from 'react';
import { AsComponentProps, IPanel } from '../types';
import { StickyButton } from '../elements/StickyButton';
import { ToolbarItem } from '../elements/ToolbarItem';

export interface PanelProps extends PropsWithChildren, AsComponentProps<IPanel> {
  value?: string;
  onClick?: () => void;
}
const Panel: FC<PanelProps> = (props) => {
  return (
    <ToolbarItem>
      <StickyButton value={props.value} name={props.id} onClick={props.onClick}>
        {props.icon}
      </StickyButton>
    </ToolbarItem>
  );
};

export default Panel;
