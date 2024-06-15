import { ApplicationLayout, Container, useInitialize } from './components/application-layout';

import { Direction } from './components/application-layout/types';

import { DefaultToolbarStackHeader } from './components/layout-preset/DefaultToolbarStackHeader';
import { Scene } from './components/application-layout/blocks/Scene';
import { useApp } from './stores/app-store';
import Welcome from './pages/Welcome';
import { useScene } from './components/application-layout/stores/scene-store';
import { FlowPage } from './pages/FlowPage';
import { useLayout } from './components/application-layout/stores/layout-store';
import MainTools from './components/layout-preset/MainTools';
import TopToolbar from './components/layout-preset/TopToolbar';
import InlineSvg from './components/application-layout/elements/InlineSvg';
import colorPanel from './icons/illustrator/color-panel.svg';
import colorGuidePanel from './icons/illustrator/color-guide-panel.svg';

function App(): JSX.Element {
  const app = useApp();
  const scene = useScene();
  const layout = useLayout();

  useInitialize(() => {
    layout.registerContainer({ id: 'container-top', maxItems: 1, direction: Direction.Vertical });

    layout.registerToolbarStack('container-top', {
      id: 'top-toolbar-stack',
      direction: Direction.Horizontal,
      draggable: true
    });
    layout.registerToolbar('top-toolbar-stack', {
      draggable: true,
      fullSize: true,
      id: 'top-tools',
      direction: Direction.Horizontal,
      content: <TopToolbar />
    });
    layout.registerContainer({ id: 'container-left', maxItems: 2, direction: Direction.Horizontal });

    layout.registerToolbarStack('container-left', {
      id: 'main-tools-stack',
      draggable: true,
      direction: Direction.Vertical,
      header: () => (
        <DefaultToolbarStackHeader
          leftButton={{
            onLeftChevronClick:
              layout.getToolbarAttribute('main-tools', 'columns') === 2 &&
              (() => {
                return layout.setToolbarAttributes('main-tools', { columns: 1 });
              }),
            onRightChevronClick:
              layout.getToolbarAttribute('main-tools', 'columns') === 1 &&
              (() => {
                return layout.setToolbarAttributes('main-tools', { columns: 2 });
              })
          }}
        />
      )
    });
    layout.registerToolbar('main-tools-stack', {
      id: 'main-tools',
      draggable: true,
      direction: Direction.Vertical,
      columns: 2,
      fullSize: true,
      content: <MainTools />
    });
    layout.registerContainer({ id: 'container-right', direction: Direction.Horizontal });

    layout.registerToolbarStack('container-right', {
      id: 'right-container-col-1',
      draggable: true,
      direction: Direction.Vertical
    });
    layout.registerToolbar('right-container-col-1', {
      id: 'right-stack-1-toolbar-1',
      draggable: true,
      direction: Direction.Vertical,
      columns:1,
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
          title: 'Color Guide' ,
          content: <div>ColorWindow {app.tool}</div>
        }
      ]
    });
  });

  const newTabContentCtor = () => {
    const id = Math.random().toString(36).substring(7);
    const content = <FlowPage id={id} />;
    return content;
  };

  const onAddTab = () => app.hideHome();
  const onCloseTab = () => requestAnimationFrame(() => scene.members.length < 1 && app.showHome());

  return (
    <ApplicationLayout home={app.home && <Welcome />} store={layout}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        <Container {...layout.containerProps('container-top')} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
        <Container {...layout.containerProps('container-left')} />
        <Scene store={scene} newTabContent={newTabContentCtor} onAddTab={onAddTab} onCloseTab={onCloseTab} />
        <Container {...layout.containerProps('container-right')} />
      </div>
    </ApplicationLayout>
  );
}

export default App;
