import { IPageProps } from '@renderer/components/application-layout/types';
import Blueprint from '@renderer/components/blueprint';
import { FC } from 'react';
const model = {
  models: {}
};
const CadPage: FC<IPageProps> = () => {
  return (
    <div style={{ flex: '1' }} className="grid-blue">
      <Blueprint model={model} />
    </div>
  );
};

export default CadPage;
