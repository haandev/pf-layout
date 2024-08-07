import { FC } from 'react';

import { TabView, TabViewCommonProps } from './TabView';

import { SceneStore } from '../../stores/scene-store';

import { evalBoolean } from '../../utils';

import { Direction, IGroupView, ITabView, IWindow, NodeType } from '../../types';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

export interface NestedTabViewProps extends TabViewCommonProps {
  store: SceneStore;
  view: IWindow | IGroupView;
  headerControls?: {
    isVisible: (view: ITabView) => boolean;
    onClick: (viewId: string) => void;
    render: JSX.Element;
  }[];
}
export const NestedTabView: FC<NestedTabViewProps> = ({ view, headerControls, id, direction, ...props }) => {
  const _direction = direction || Direction.Horizontal;
  const oppositeDirection = _direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
  return (
    <>
      {'members' in view &&
        view.members.map((viewItem, idx) => {
          if (!viewItem) return null;
          let render: JSX.Element;
          if (viewItem.type === NodeType.TabView) {
            const activeTabId = viewItem.activeTabId;
            const renderedHeaderControls = headerControls?.map(
              (control, idx) =>
                evalBoolean(control.isVisible, viewItem) && (
                  <button key={idx} className="pf-tab-header-button" onClick={() => control.onClick(viewItem.id)}>
                    {control.render}
                  </button>
                )
            );
            render = (
              <Panel>
                <TabView
                  activeTabId={activeTabId}
                  direction={_direction}
                  headerControls={!!renderedHeaderControls?.length && renderedHeaderControls}
                  height={viewItem.height}
                  members={viewItem.members}
                  id={viewItem.id}
                  key={viewItem.id}
                  {...props}
                />
              </Panel>
            );
          } else {
            render = (
              <Panel>
                <PanelGroup direction={oppositeDirection}>
                  <NestedTabView
                    direction={oppositeDirection}
                    headerControls={headerControls}
                    id={viewItem.id}
                    view={viewItem}
                    {...props}
                  />
                </PanelGroup>
              </Panel>
            );
          }

          if (idx !== view.members.length - 1) {
            render = (
              <>
                {render} <PanelResizeHandle />
              </>
            );
          }
          return render;
        })}
    </>
  );
};
