import React from 'react';
import './gc.spread.sheets.all.17.1.4.min.js';
import '@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
import GC from '@mescius/spread-sheets';
import { SpreadSheets, Worksheet } from '@mescius/spread-sheets-react';

const Spread = () => {
  let initSpread = function (value: GC.Spread.Sheets.Workbook) {
    let spread = value;
    let sheet1 = spread.getSheet(0);
    sheet1.setValue(0, 0, 'Hello World!');
  };
  return (
      <SpreadSheets workbookInitialized={(spread) => initSpread(spread)}>
        <Worksheet></Worksheet>
      </SpreadSheets>
  );
};

export default Spread;
