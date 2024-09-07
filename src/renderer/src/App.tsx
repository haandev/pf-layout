import { useCallback, useRef } from 'react';

import { ApplicationLayout, Container, useInitialize } from './components/application-layout';
import { Direction } from './components/application-layout/types';

import { InlineSvg } from './components/application-layout/elements';
import MainTools from './components/layout-preset/MainTools';
import TopToolbar from './components/layout-preset/TopToolbar';
import Welcome from './pages/Welcome';
import colorGuidePanel from './icons/illustrator/color-guide-panel.svg';
import colorPanel from './icons/illustrator/color-panel.svg';
import { ContainerProps } from './components/application-layout/blocks/scene/Container';
import { OnCloseTabHandler } from './components/application-layout/types.event';
import { Scene } from './components/application-layout/blocks/scene/Scene';
import { useApp } from './stores/app-store';
import { useLayout } from './components/application-layout/stores/layout-store';
import { useScene } from './components/application-layout/stores/scene-store';
import { ColorPanel, CompactColorPanel } from './components/layout-preset/ColorPanel';
//import Spread from './components/spread/Spread';
import FormulaBar from './components/spread/FormulaBar';
//import { useWorkbook } from './components/spread/workbook-store';
//import GC from '@mescius/spread-sheets';
import FormulaPanel from './components/spread/FormulaPanel';
function App(): JSX.Element {
  const formulaPanelRef = useRef<any>(null);
  const formulaTextBoxRef = useRef<any>(null); //TODO:type ref type of FormulaBar component

  /* const setWorkbook = useCallback((workbook?: GC.Spread.Sheets.Workbook) => {
    if (!workbook) return;
    formulaTextBoxRef.current?.setWorkbook(workbook);
    formulaPanelRef.current?.setWorkbook(workbook);
  }, []); */
  const timeout = useRef<any | null>(null);
  const app = useApp();
  const scene = useScene();
  const layout = useLayout();
  //const workbook = useWorkbook();

  const evaluateResize = useCallback(() => {
    console.log('resized');
    //this is a patch for blueprint component pointer issue
    timeout.current && clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      window.dispatchEvent(new Event('resize')); //due to blueprint component pointer issue //TODO:onwindowmove handler on scene component
    }, 30);
  }, []);

  useInitialize(() => {
    //top container
    const topContainer = layout.$container({
      id: 'container-top',
      maxItems: 2,
      direction: Direction.Vertical
    });
    topContainer.$stack({ id: 'top-stack', direction: Direction.Horizontal, draggable: true }).$toolbar({
      draggable: true,
      fullSize: true,
      id: 'top-tools',
      direction: Direction.Horizontal,
      content: <TopToolbar />
    });
    topContainer
      .$stack({ id: 'init-formula', direction: Direction.Horizontal, draggable: true, header: true })
      .$toolbar({
        draggable: true,
        fullSize: false,
        showHandle: true,
        id: 'top-tools-2',
        direction: Direction.Horizontal,
        content: <FormulaBar ref={formulaTextBoxRef} />
      });

    //left container
    layout
      .$container({
        id: 'container-left',
        direction: Direction.Horizontal,
        chevronPosition: 'start',
        maxItems: 2
      })
      .$stack({
        id: 'main-tools-stack',
        draggable: true,
        direction: Direction.Vertical,
        isExpanded: () => layout.$toolbar('main-tools')?.columns === 2,
        onCollapse: () => layout.$toolbar('main-tools')?.$set({ columns: 1 }),
        onExpand: () => layout.$toolbar('main-tools')?.$set({ columns: 2 })
      })
      .$toolbar({
        id: 'main-tools',
        draggable: false,
        direction: Direction.Vertical,
        columns: 2,
        fullSize: true,
        showHandle: true,
        content: <MainTools />
      });

    //right container
    layout
      .$container({ id: 'container-right', direction: Direction.Horizontal })
      .$stack({
        id: 'right-container-col-1',
        direction: Direction.Vertical,
        draggable: true,
        onExpand: (thisStack) => thisStack?.$asTabs(),
        onCollapse: (thisStack) => thisStack?.$asToolbar()
      })
      .$toolbar({
        id: 'right-stack-1-toolbar-1',
        draggable: true,
        showHandle: true,
        direction: Direction.Vertical,
        columns: 1,
        members: [
          {
            id: 'fx-panel',
            icon: 'FX',
            title: 'Formula Panel',
            content: <FormulaPanel ref={formulaPanelRef} />
          },
          {
            id: 'color-panel',
            icon: <InlineSvg source={colorPanel} />,
            title: 'Color',
            content: <ColorPanel />,
            compactContent: <CompactColorPanel />
          },
          {
            id: 'color-guide-panel',
            icon: <InlineSvg source={colorGuidePanel} />,
            title: 'Color Guide',
            content: <div>Color guide window</div>
          }
        ]
      });
  });

  const newTabContentCtor = () => {
    const id = Math.random().toString(36).substring(7);
    //const instance = workbook.getWorkbook(id);

    /* const content = (
      <Spread
        key={id}
        workbook={instance}
        workbookInitialized={(initializedInstance) => {
          workbook.register(id, initializedInstance);
        }}
        hostFocused={setWorkbook}
      />
    ); */

    const content = <div id={id} key={id}></div>;
    return content;
  };

  const onAddTab = () => {
    evaluateResize();
    app.hideHome();
  };
  const onCloseTab: OnCloseTabHandler = (_, __, state) => {
    evaluateResize();
    return state.length < 1 && app.showHome();
  };

  return (
    <ApplicationLayout home={app.home && <Welcome id="welcome" />} store={layout}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        {<Container {...(layout.$container('container-top')?.$props as ContainerProps)} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
        <Container {...(layout.$container('container-left')?.$props as ContainerProps)} />
        <Scene
          store={scene}
          newTabContent={newTabContentCtor}
          onAddTab={onAddTab}
          onCloseTab={onCloseTab}
          onWindowMove={evaluateResize}
          onWindowResize={evaluateResize}
          onSceneResize={evaluateResize}
          onPanelResize={evaluateResize}
          onDetach={evaluateResize}
          onMoveTab={evaluateResize}
          onTabChange={evaluateResize}
        />
        <Container {...(layout.$container('container-right')?.$props as ContainerProps)} />
      </div>
    </ApplicationLayout>
  );
}

export default App;
