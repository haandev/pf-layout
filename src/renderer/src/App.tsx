import { ApplicationLayout, Container, useInitialize } from './components/application-layout';

import { Direction } from './components/application-layout/types';

import { Scene } from './components/application-layout/blocks/Scene';
import { useApp } from './stores/app-store';
import Welcome from './pages/Welcome';
import { useScene } from './components/application-layout/stores/scene-store';
import { useLayout } from './components/application-layout/stores/layout-store';
import MainTools from './components/layout-preset/MainTools';
import TopToolbar from './components/layout-preset/TopToolbar';
import InlineSvg from './components/application-layout/elements/InlineSvg';
import colorPanel from './icons/illustrator/color-panel.svg';
import colorGuidePanel from './icons/illustrator/color-guide-panel.svg';
import { ContainerProps } from './components/application-layout/blocks/Container';
import CadPage from './pages/CadPage';
import { useCallback, useRef } from 'react';

function App(): JSX.Element {
  const timeout = useRef<any | null>(null);
  const app = useApp();
  const scene = useScene();
  const layout = useLayout();

  const windowMoveOrResize = useCallback(() => {
    //this is a patch for blueprint component pointer issue
    timeout.current && clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      window.dispatchEvent(new Event('resize')); //due to blueprint component pointer issue //TODO:onwindowmove handler on scene component
    }, 500);
  }, []);

  useInitialize(() => {
    //top container
    layout
      .container({ id: 'container-top', maxItems: 1, direction: Direction.Vertical })
      .$stack({ id: 'top-toolbar-stack', direction: Direction.Horizontal, draggable: true })
      .$toolbar({
        draggable: true,
        fullSize: true,
        id: 'top-tools',
        direction: Direction.Horizontal,
        content: <TopToolbar />
      });

    //left container
    layout
      .container({ id: 'container-left', maxItems: 2, direction: Direction.Horizontal, chevronPosition: 'start' })
      .$stack({
        id: 'main-tools-stack',
        draggable: true,
        direction: Direction.Vertical,
        isExpanded: () => layout.toolbar('main-tools')?.columns === 2,
        onCollapse: () => layout.toolbar('main-tools')?.$set({ columns: 1 }),
        onExpand: () => layout.toolbar('main-tools')?.$set({ columns: 2 })
      })
      .$toolbar({
        id: 'main-tools',
        draggable: true,
        direction: Direction.Vertical,
        columns: 2,
        fullSize: true,
        showHandle: true,
        content: <MainTools />
      });

    //right container
    layout
      .container({ id: 'container-right', direction: Direction.Horizontal })
      .$stack({
        id: 'right-container-col-1',
        direction: Direction.Vertical,
        draggable: true
      })
      .$toolbar({
        id: 'right-stack-1-toolbar-1',
        draggable: true,
        showHandle: true,
        direction: Direction.Vertical,
        columns: 1,
        members: [
          {
            id: 'color-panel',
            icon: <InlineSvg source={colorPanel} />,
            title: 'Color',
            content: <div>ColorWindow {app.tool}</div>
          },
          {
            id: 'color-guide-panel',
            icon: <InlineSvg source={colorGuidePanel} />,
            title: 'Color Guide',
            content: <div>ColorWindow {app.tool}</div>
          }
        ]
      });
  });

  const newTabContentCtor = () => {
    const id = Math.random().toString(36).substring(7);
    const content = <CadPage id={id} />;
    return content;
  };

  const onAddTab = () => app.hideHome();
  const onCloseTab = () => requestAnimationFrame(() => scene.members.length < 1 && app.showHome());

  return (
    <ApplicationLayout home={app.home && <Welcome id="welcome" />} store={layout}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        {<Container {...(layout.container('container-top')?.$props as ContainerProps)} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
        <Container {...(layout.container('container-left')?.$props as ContainerProps)} />
        <Scene
          store={scene}
          newTabContent={newTabContentCtor}
          onAddTab={onAddTab}
          onCloseTab={onCloseTab}
          onWindowMove={windowMoveOrResize}
          onWindowResize={windowMoveOrResize}
        />
        <Container {...(layout.container('container-right')?.$props as ContainerProps)} />
      </div>
    </ApplicationLayout>
  );
}

export default App;
