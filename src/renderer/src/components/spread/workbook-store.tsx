import { create } from 'zustand';
import GC from '@mescius/spread-sheets';

export interface WorkbookStore {
  workbooks: Record<string, GC.Spread.Sheets.Workbook>;
  register: (id: string, workbook: GC.Spread.Sheets.Workbook) => void;
  getWorkbook: (id: string) => GC.Spread.Sheets.Workbook | undefined;
}

export const useWorkbook = create<WorkbookStore>((set) => ({
  workbooks: {},
  register(id, workbook) {
    set((state) => ({
      workbooks: { ...state.workbooks, [id]: workbook }
    }));
  },
  getWorkbook(id) {
    return this.workbooks[id];
  }
}));
