import { FC } from 'react';
import { StickyButton } from '../application-layout';
import { useApp } from '@renderer/stores/app-store';
import InlineSvg from '../application-layout/elements/InlineSvg';

export interface AppStickyButtonProps {
  source: string | URL | Request;
  name: string;
}
export const AppToolsStickySvgButton: FC<AppStickyButtonProps> = ({ source, name }) => {
  const app = useApp();
  return <StickyButton name={name} value={app.tool} onChange={app.setTool} children={<InlineSvg source={source} width={16} height={16} />} />;
};
