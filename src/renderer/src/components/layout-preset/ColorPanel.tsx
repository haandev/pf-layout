import { useApp } from '@renderer/stores/app-store';

export const ColorPanel = () => {
  const app = useApp();
  return <div>ColorPanel {app.tool}</div>;
};

export const CompactColorPanel = () => {
  const app = useApp();
  return <div>CompactColorPanel {app.tool}</div>;
};
