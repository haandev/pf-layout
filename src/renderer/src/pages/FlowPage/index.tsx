import { IPageProps } from '@renderer/components/application-layout/types';
import React, { FC } from 'react';
import ReactFlow, { Background, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

export interface FlowPageProps extends IPageProps {}

export const FlowPage: FC<FlowPageProps> = React.memo(({ id }) => {
  return (
    <ReactFlowProvider>
      <FlowPageProvided id={id} />
    </ReactFlowProvider>
  );
});
const FlowPageProvided: FC<FlowPageProps> = React.memo(({ id }) => {
  /*  const _setFlow = useApp((store) => store.setFlow);
  const _flow = useReactFlow(); */

  return (
    <div style={{ height: '100%', width: '100%', background: 'white' }}>
      <ReactFlow proOptions={{ hideAttribution: true }}>
        <Background id={id} />
      </ReactFlow>
    </div>
  );
});
