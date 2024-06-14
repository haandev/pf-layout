import { ApplicationLayout, DragHandle, IconButton, Container, Toolbar, ToolbarItem, ToolbarStack, Separator, Label } from './components/application-layout';

import { Direction, IWindow, NodeType } from './components/application-layout/types';

import IconFolderOpen from './icons/IconFolderOpen';
import IconHome from './icons/IconHome';
import IconSave from './icons/IconSave';
import InlineSvg from './components/application-layout/elements/InlineSvg';
import IconLayout from './components/application-layout/icons/IconLayout';
import IconSplitSquareHorizontal from './components/application-layout/icons/IconSplitSquareHorizontal';
import IconSplitSquareVertical from './components/application-layout/icons/IconSplitSquareVertical';
import IconWindowStack from './components/application-layout/icons/IconWindowStack';

import addAnchor from './icons/illustrator/add-anchor.svg';
import anchorPointTool from './icons/illustrator/anchor-point-tool.svg';
import arcTool from './icons/illustrator/arc-tool.svg';
import areaTypeTool from './icons/illustrator/area-type-tool.svg';
import curvatureTool from './icons/illustrator/curvature-tool.svg';
import directSelectTool from './icons/illustrator/direct-select-tool.svg';
import ellipsesTool from './icons/illustrator/ellipses-tool.svg';
import gridTool from './icons/illustrator/grid-tool.svg';
import groupSelectionTool from './icons/illustrator/group-selection-tool.svg';
import lassoTool from './icons/illustrator/lasso-tool.svg';
import lineSegmentTool from './icons/illustrator/line-segment-tool.svg';
import magicWandTool from './icons/illustrator/magic-wand-tool.svg';
import minusAnchor from './icons/illustrator/minus-anchor.svg';
import penTool from './icons/illustrator/pen-tool.svg';
import polarGridTool from './icons/illustrator/polar-grid-tool.svg';
import rectangleTool from './icons/illustrator/rectangle-tool.svg';
import roundedRectangleTool from './icons/illustrator/rounded-rectangle-tool.svg';
import selectionTool from './icons/illustrator/selection-tool.svg';
import spiralTool from './icons/illustrator/spiral-tool.svg';
import touchTypeTool from './icons/illustrator/touch-type-tool.svg';
import typeOnAPathTool from './icons/illustrator/type-on-a-path-tool.svg';
import typeTool from './icons/illustrator/type-tool.svg';
import verticalAreaTypeTool from './icons/illustrator/vertical-area-type-tool.svg';
import verticalTypeOnAPathTool from './icons/illustrator/vertical-type-on-a-path-tool.svg';
import verticalTypeTool from './icons/illustrator/vertical-type-tool.svg';
import areaGraphTool from './icons/illustrator/area-graph-tool.svg';
import columnGraphTool from './icons/illustrator/column-graph-tool.svg';
import lineGraphTool from './icons/illustrator/line-graph-tool.svg';
import pieGraphTool from './icons/illustrator/pie-graph-tool.svg';
import scatterGraphTool from './icons/illustrator/scatter-graph-tool.svg';
import barGraphTool from './icons/illustrator/bar-graph-tool.svg';
import polygonTOol from './icons/illustrator/polygon-tool.svg';
import starTool from './icons/illustrator/star-tool.svg';
import flareTool from './icons/illustrator/flare-tool.svg';
import zoom from './icons/illustrator/zoom.svg';
import zoomIn from './icons/illustrator/zoom-in.svg';
import zoomOut from './icons/illustrator/zoom-out.svg';

import { DefaultToolbarStackHeader } from './components/layout-preset/DefaultToolbarStackHeader';
import { ToolbarStackGroup } from './components/application-layout/blocks/ToolbarStackGroup';
import { AppStickyGroupButton } from './components/layout-preset/AppStickyGroupButton';
import { AppToolsStickySvgButton } from './components/layout-preset/AppStickyButton';
import { Scene } from './components/application-layout/blocks/Scene';
import { useApp } from './stores/app-store';
import Welcome from './pages/Welcome';
import { useScene } from './components/application-layout/stores/scene-store';
import { FlowPage } from './pages/FlowPage';

function App(): JSX.Element {
  const app = useApp();
  const scene = useScene();

  const newTabContentCtor = () => {
    const id = Math.random().toString(36).substring(7);
    const content = <FlowPage id={id} />;
    return content;
  };

  return (
    <ApplicationLayout home={scene.home && <Welcome />}>
      <Container name="top-toolbar-container" direction={Direction.Vertical} maxItems={1}>
        <ToolbarStackGroup>
          <ToolbarStack name="top-toolbar-stack" direction={Direction.Horizontal} maxItems={1}>
            <Toolbar name="main-toolbar" direction={Direction.Horizontal}>
              <DragHandle />
              <ToolbarItem children={<IconButton children={<IconHome />} onClick={scene.showHome} />} />
              <Separator />
              <ToolbarItem children={<Label>Nothing selected</Label>} />
              <Separator />
              <ToolbarItem children={<IconButton children={<IconSave />} />} />
              <ToolbarItem children={<IconButton children={<IconFolderOpen />} />} />
              <ToolbarItem children={<AppToolsStickySvgButton source={selectionTool} name="selection" />} />
              <Separator />
              <ToolbarItem children={<IconButton onClick={() => app.flow?.zoomIn()} children={<InlineSvg source={zoomIn} />} />} />
              <ToolbarItem children={<IconButton onClick={() => app.flow?.zoomOut()} children={<InlineSvg source={zoomOut} />} />} />
              <ToolbarItem children={<IconButton onClick={() => app.flow?.fitView()} children={<InlineSvg source={zoom} />} />} />
            </Toolbar>
          </ToolbarStack>
        </ToolbarStackGroup>
      </Container>
      <Container name="center-container" style={{ flex: 1 }} direction={Direction.Horizontal}>
        <ToolbarStackGroup onClose={() => {}}>
          <ToolbarStack
            name="main-tools-stack"
            direction={Direction.Vertical}
            header={
              <DefaultToolbarStackHeader
                leftButton={{
                  onLeftChevronClick: app.toolbarColSize === 2 && (() => app.setToolbarColSize(1)),
                  onRightChevronClick: app.toolbarColSize === 1 && (() => app.setToolbarColSize(2))
                }}
              />
            }
          >
            <Toolbar name="main-tools" direction={Direction.Vertical} dragHandle={<DragHandle />} columns={app.toolbarColSize}>
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
                      type1: { source: typeTool, label: 'Type Tool' },
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
            </Toolbar>
          </ToolbarStack>
        </ToolbarStackGroup>
        <Scene store={scene} newTabContent={newTabContentCtor} />
        <ToolbarStackGroup onClose={() => {}}>
          <ToolbarStack
            name="main-tools-stack"
            direction={Direction.Vertical}
            header={
              <DefaultToolbarStackHeader
                leftButton={{
                  onLeftChevronClick: app.toolbarColSize === 2 && (() => app.setToolbarColSize(1)),
                  onRightChevronClick: app.toolbarColSize === 1 && (() => app.setToolbarColSize(2))
                }}
              />
            }
          >
            <Toolbar name="main-tools" direction={Direction.Vertical} dragHandle={<DragHandle />} columns={app.toolbarColSize}>
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
                      type1: { source: typeTool, label: 'Type Tool' },
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
            </Toolbar>
          </ToolbarStack>
        </ToolbarStackGroup>
      </Container>
    </ApplicationLayout>
  );
}

export default App;
