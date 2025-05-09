import * as React from 'react';
import styles from './Grid.module.css';
import { useBlueprint } from '../store';
import { getGridScale } from '../geometry';
import * as makerjs from 'makerjs';

const Grid = ({}: {}) => {
  const [patternId] = React.useState(() => Math.ceil(Math.random() * 100000).toString() + '-gridPattern');
  const view = useBlueprint((state) => state.view);
  let gridScale = getGridScale(view);
  let p = makerjs.point.add(view.origin, view.panOffset);
  let transform = `translate(${p[0]},${p[1]})`;

  return (
    <svg className={styles.grid}>
      <defs>
        <pattern id={patternId + 'pattern1'} x="0" y="0" width=".1" height=".1">
          <line x1="0" y1="0" x2="0" y2="100%" className={styles.gridLine1}></line>
          <line x1="0" y1="0" x2="100%" y2="0" className={styles.gridLine1}></line>
        </pattern>
        <pattern id={patternId + 'pattern10'} x="0" y="0" width="1" height="1">
          <line x1="0" y1="0" x2="0" y2="100%" className={styles.gridLine10}></line>
          <line x1="0" y1="0" x2="100%" y2="0" className={styles.gridLine10}></line>
        </pattern>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width={gridScale}
          height={gridScale}
          patternUnits="userSpaceOnUse"
          patternTransform={transform}
        >
          <rect
            id="gridPatternFill"
            fill={`url(#${patternId}pattern1) `}
            width={gridScale}
            height={gridScale}
            x="0"
            y="0"
          ></rect>
          <rect fill={`url(#${patternId}pattern10) `} width="100%" height="100%" x="0" y="0"></rect>
        </pattern>
      </defs>
      <rect fill={`url(#${patternId})`} width="100%" height="100%" x="0" y="0"></rect>
      <g transform={transform}>
        <line className={styles.crosshairsLine} x1="-100%" x2="100%" y1="0" y2="0"></line>
        <line className={styles.crosshairsLine} x1="0" x2="0" y1="-100%" y2="100%"></line>
      </g>
    </svg>
  );
};

export default Grid;
