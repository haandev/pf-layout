import { ApplicationLayout, Container, useInitialize } from './components/application-layout';
import { Direction } from './components/application-layout/types';

import { InlineSvg } from './components/application-layout/elements';
import MainTools from './components/layout-preset/MainTools';
import TopToolbar from './components/layout-preset/TopToolbar';
import Welcome from './pages/Welcome';
import colorGuidePanel from './icons/illustrator/color-guide-panel.svg';
import colorPanel from './icons/illustrator/color-panel.svg';
import { ContainerProps } from './components/application-layout/blocks/scene/Container';
import { useApp } from './stores/app-store';
import { useLayout } from './components/application-layout/stores/layout-store';
import OpenLayersPage from './pages/OpenLayersPage/OpenLayersPage';
import { LayersPanel } from './components/layout-preset/LayersPanel';
function App(): JSX.Element {
  const app = useApp();
  const layout = useLayout();

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
            id: 'layers',
            icon: <InlineSvg source={colorPanel} />,
            title: 'Layers',
            content: <LayersPanel />,
            visibility: 'full'
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
  return (
    <ApplicationLayout home={!app.home && <Welcome id="welcome" />} store={layout}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        <Container {...(layout.$container('container-top')?.$props as ContainerProps)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
        <Container {...(layout.$container('container-left')?.$props as ContainerProps)} />
        <div style={{ flex: 1 }}>
          <OpenLayersPage />
        </div>
        <Container {...(layout.$container('container-right')?.$props as ContainerProps)} />
      </div>
    </ApplicationLayout>
  );
}

export default App;
