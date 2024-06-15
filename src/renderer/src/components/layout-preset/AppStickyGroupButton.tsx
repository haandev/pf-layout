import { FC } from 'react';
import { StickyGroupButton } from '../application-layout';
import { useApp } from '../../stores/app-store';
import InlineSvg from '../application-layout/elements/InlineSvg';

export interface AppStickyGroupButtonProps {
  items: Record<
    string,
    {
      source: string | URL | Request;
      label: string;
    }
  >;
}
export const AppStickyGroupButton: FC<AppStickyGroupButtonProps> = ({ items }) => {
  const app = useApp();

  const renderItems = Object.fromEntries(
    Object.entries(items).map(([key, value]) => {
      return [
        key,
        {
          render: <InlineSvg source={value.source} width={16} height={16} />,
          label: value.label
        }
      ];
    })
  );

  return <StickyGroupButton items={renderItems} value={app.tool} onChange={app.setTool} />;
};
