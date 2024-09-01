import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import type GC from '@mescius/spread-sheets';
import '@mescius/spread-sheets-formula-panel';
declare global {
  interface Window {
    GC: typeof GC;
  }
}
const FormulaPanel = forwardRef((_props, ref) => {
  const GC = window.GC;
  const host = useRef<HTMLInputElement>(null);
  const formulaEditor = useRef<GC.Spread.Sheets.FormulaPanel.FormulaEditor>();
  useEffect(() => {
    if (!host.current) return;
    host.current.innerHTML = '';
    formulaEditor.current = new GC.Spread.Sheets.FormulaPanel.FormulaEditor(host.current);
  }, [host.current]);

  const setWorkbook = useCallback((workbook?: GC.Spread.Sheets.Workbook) => {
    if (!workbook) return;
    formulaEditor.current?.attach(workbook);
    console.log(formulaEditor.current?.text())
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setWorkbook
    }),
    [setWorkbook]
  );

  return (
    <div className="formula-editor">
      <div ref={host} />
    </div>
  );
});

export default FormulaPanel;
