import { create } from 'zustand';
import { ReactFlowInstance } from 'reactflow';

export interface AppStore {
  //toolbar state
  tool: string;
  toolbarColSize: number;

  //toolbar actions
  setTool: (tool: string) => void;
  setToolbarColSize: (size: number) => void;

  //app state TODO: move to separate store
  flow?: ReactFlowInstance;

  //app actions
  setFlow: (flow: ReactFlowInstance) => void;
}
export const useApp = create<AppStore>((set) => ({
  flow: undefined,
  setFlow: (flow) => set({ flow }),
  tool: 'selection',
  setTool: (tool) => set({ tool: tool }),
  toolbarColSize: 1,
  setToolbarColSize: (size) => set({ toolbarColSize: size })
}));
