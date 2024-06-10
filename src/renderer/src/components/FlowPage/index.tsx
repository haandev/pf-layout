import { useApp } from '@renderer/store/app-store'
import React, { FC } from 'react'
import { useInView } from 'react-intersection-observer'
import ReactFlow, { Background, ReactFlowProvider, useReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'

export interface FlowPageProps {
  id: string
}

export const FlowPageProvided: FC<FlowPageProps> = React.memo(({ id }) => {
  return (
    <ReactFlowProvider>
      <FlowPage id={id} />
    </ReactFlowProvider>
  )
})
const FlowPage: FC<FlowPageProps> = React.memo(({ id }) => {
  const setFlow = useApp((store) => store.setFlow)
  const flow = useReactFlow()
  const { ref } = useInView({
    onChange: (inView) => {
      if (!inView) return
      setFlow(flow)
    }
  })
  return (
    <div ref={ref} style={{ height: '100%', width: '100%', background: 'white' }}>
      <ReactFlow proOptions={{ hideAttribution: true }}>
        <Background id={id} />
      </ReactFlow>
    </div>
  )
})
