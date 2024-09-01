import '@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
import GC from '@mescius/spread-sheets'
import { SpreadSheets, SpreadSheetsProp } from '@mescius/spread-sheets-react';
import React, { useEffect } from 'react';
import './styles.css';
const Spread = ({
  workbook,
  hostFocused,
  ...gcProps
}: SpreadSheetsProp & {
  workbook?: GC.Spread.Sheets.Workbook;
  hostFocused?: (workbook: GC.Spread.Sheets.Workbook) => void;
}) => {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const workbookInstance = React.useRef(workbook);
  useEffect(() => {
    if (workbook && hostRef.current) {
      const workbookHost = workbook.getHost();
      hostRef.current.innerHTML = '';
      hostRef.current?.appendChild(workbookHost);
    }
  }, []);
  return (
    <div ref={hostRef} style={{ height: '100%' }} onClick={() => hostFocused?.(workbookInstance.current!)}>
      {!Boolean(workbook) && (
        <SpreadSheets
          {...gcProps}
          workbookInitialized={(initializedInstance) => {
            workbookInstance.current = initializedInstance;
            gcProps.workbookInitialized?.(initializedInstance);
          }}
        />
      )}
    </div>
  );
};

export default React.memo(Spread);
