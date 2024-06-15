import addAnchor from '../../icons/illustrator/add-anchor.svg';
import anchorPointTool from '../../icons/illustrator/anchor-point-tool.svg';
import arcTool from '../../icons/illustrator/arc-tool.svg';
import areaTypeTool from '../../icons/illustrator/area-type-tool.svg';
import curvatureTool from '../../icons/illustrator/curvature-tool.svg';
import directSelectTool from '../../icons/illustrator/direct-select-tool.svg';
import ellipsesTool from '../../icons/illustrator/ellipses-tool.svg';
import gridTool from '../../icons/illustrator/grid-tool.svg';
import groupSelectionTool from '../../icons/illustrator/group-selection-tool.svg';
import lassoTool from '../../icons/illustrator/lasso-tool.svg';
import lineSegmentTool from '../../icons/illustrator/line-segment-tool.svg';
import magicWandTool from '../../icons/illustrator/magic-wand-tool.svg';
import minusAnchor from '../../icons/illustrator/minus-anchor.svg';
import penTool from '../../icons/illustrator/pen-tool.svg';
import polarGridTool from '../../icons/illustrator/polar-grid-tool.svg';
import rectangleTool from '../../icons/illustrator/rectangle-tool.svg';
import roundedRectangleTool from '../../icons/illustrator/rounded-rectangle-tool.svg';
import { ToolbarItem } from '../application-layout';
import { AppToolsStickySvgButton } from './AppStickyButton';
import { AppStickyGroupButton } from './AppStickyGroupButton';
import selectionTool from '../../icons/illustrator/selection-tool.svg';
import spiralTool from '../../icons/illustrator/spiral-tool.svg';
import touchTypeTool from '../../icons/illustrator/touch-type-tool.svg';
import typeOnAPathTool from '../../icons/illustrator/type-on-a-path-tool.svg';
import typeTool from '../../icons/illustrator/type-tool.svg';
import verticalAreaTypeTool from '../../icons/illustrator/vertical-area-type-tool.svg';
import verticalTypeOnAPathTool from '../../icons/illustrator/vertical-type-on-a-path-tool.svg';
import verticalTypeTool from '../../icons/illustrator/vertical-type-tool.svg';
import areaGraphTool from '../../icons/illustrator/area-graph-tool.svg';
import columnGraphTool from '../../icons/illustrator/column-graph-tool.svg';
import lineGraphTool from '../../icons/illustrator/line-graph-tool.svg';
import pieGraphTool from '../../icons/illustrator/pie-graph-tool.svg';
import scatterGraphTool from '../../icons/illustrator/scatter-graph-tool.svg';
import barGraphTool from '../../icons/illustrator/bar-graph-tool.svg';
import polygonTOol from '../../icons/illustrator/polygon-tool.svg';
import starTool from '../../icons/illustrator/star-tool.svg';
import flareTool from '../../icons/illustrator/flare-tool.svg';
import React from 'react';

const MainTools = React.memo(() => {
  return (
    <>
      <ToolbarItem children={<AppToolsStickySvgButton source={selectionTool} name="selection" />} />
      <ToolbarItem
        children={
          <AppStickyGroupButton
            items={{
              directSelection: { source: directSelectTool, label: 'Direct Selection Tool' },
              groupSelection: { source: groupSelectionTool, label: 'Group Selection Tool' }
            }}
          />
        }
      />
      <ToolbarItem children={<AppToolsStickySvgButton source={magicWandTool} name="magic" />} />{' '}
      <ToolbarItem children={<AppToolsStickySvgButton source={lassoTool} name="lasso" />} />{' '}
      <ToolbarItem
        children={
          <AppStickyGroupButton
            items={{
              pen: { source: penTool, label: 'Pen Tool' },
              penPlus: { source: addAnchor, label: 'Add Anchor Point Tool' },
              penMinus: { source: minusAnchor, label: 'Delete Anchor Point Tool' },
              anchorPointCorner: { source: anchorPointTool, label: 'Anchor Point Tool' }
            }}
          />
        }
      />
      <ToolbarItem children={<AppToolsStickySvgButton source={curvatureTool} name="curve-pen" />} />
      <ToolbarItem
        children={
          <AppStickyGroupButton
            items={{
              type: { source: typeTool, label: 'Type Tool' },
              areaType: { source: areaTypeTool, label: 'Area Type Tool' },
              typeOnPath: { source: typeOnAPathTool, label: 'Type on Path Tool' },
              typeVertical: { source: verticalTypeTool, label: 'Vertical Type Tool' },
              areaTypeVertical: { source: verticalAreaTypeTool, label: 'Vertical Area Type Tool' },
              typeOnPathVertical: { source: verticalTypeOnAPathTool, label: 'Vertical Type on Path Tool' },
              typeTap: { source: touchTypeTool, label: 'Type Tap Tool' }
            }}
          />
        }
      />
      <ToolbarItem
        children={
          <AppStickyGroupButton
            items={{
              line: { source: lineSegmentTool, label: 'Line Segment Tool' },
              arc: { source: arcTool, label: 'Arc Tool' },
              spiral: { source: spiralTool, label: 'Spiral Tool' },
              polarGrid: { source: polarGridTool, label: 'Polar Grid Tool' },
              grid: { source: gridTool, label: 'Grid Tool' }
            }}
          />
        }
      />
      <ToolbarItem
        children={
          <AppStickyGroupButton
            items={{
              rectangle: { source: rectangleTool, label: 'Rectangle Tool' },
              roundedRectangle: { source: roundedRectangleTool, label: 'Rounded Rectangle Tool' },
              ellipse: { source: ellipsesTool, label: 'Ellipse Tool' },
              polygon: { source: polygonTOol, label: 'Polygon Tool' },
              star: { source: starTool, label: 'Star Tool' },
              flare: { source: flareTool, label: 'Flare Tool' }
            }}
          />
        }
      />
      <ToolbarItem
        children={
          <AppStickyGroupButton
            items={{
              areaGraph: { source: areaGraphTool, label: 'Graph Tool' },
              columnGraph: { source: columnGraphTool, label: 'Column Graph Tool' },
              lineGraph: { source: lineGraphTool, label: 'Line Graph Tool' },
              pieGraph: { source: pieGraphTool, label: 'Pie Graph Tool' },
              scatterGraph: { source: scatterGraphTool, label: 'Scatter Graph Tool' },
              barGraph: { source: barGraphTool, label: 'Bar Graph Tool' }
            }}
          />
        }
      />
    </>
  );
});

export default MainTools;
