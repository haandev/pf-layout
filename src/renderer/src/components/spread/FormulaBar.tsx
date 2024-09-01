import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import GC from '@mescius/spread-sheets';
import '@mescius/spread-sheets-formula-textbox';

const FormulaBar = forwardRef((_props, ref) => {
  const formulaTextBox = useRef<GC.Spread.Sheets.FormulaTextBox.FormulaTextBox>();
  const host = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!host.current) return;
    formulaTextBox.current = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(host.current, {
      rangeSelectMode: false,
      absoluteReference: false
    });
  }, [host.current]);
  const setWorkbook = useCallback((workbook?: GC.Spread.Sheets.Workbook) => {
    if (!workbook) return;
    formulaTextBox.current?.workbook(workbook);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setWorkbook
    }),
    [setWorkbook]
  );
  return (
    <div className="formula-bar">
      <span>FX:</span>
      <input className="formula-text-box" ref={host}></input>
    </div>
  );
});

export default FormulaBar;
