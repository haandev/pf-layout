import { FC } from 'react';

import { TabView, TabViewCommonProps } from './TabView';

import { SceneStore } from '../../stores/scene-store';

import { evalBoolean } from '../../utils';

import { Direction, IGroupView, ITabView, IWindow, NodeType } from '../../types';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

export type HeaderControl = {
  isVisible: (view: ITabView) => boolean;
  onClick: (viewId: string) => void;
  render: JSX.Element;
};
export interface NestedTabViewProps extends TabViewCommonProps {
  store: SceneStore;
  view: IWindow | IGroupView;
  headerControls?: HeaderControl[];
}
export const NestedTabView: FC<NestedTabViewProps> = ({ view, headerControls, id, direction, ...props }) => {
  const _direction = direction || Direction.Horizontal;
  const oppositeDirection = _direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
  const renderHeaderControls = (viewItem: ITabView) =>
    headerControls?.length &&
    headerControls.map(
      (control, idx) =>
        evalBoolean(control.isVisible, viewItem) && (
          <button key={idx} className="pf-tab-header-button" onClick={() => control.onClick(viewItem.id)}>
            {control.render}
          </button>
        )
    );
  return (
    <PanelGroup direction={_direction}>
      {'members' in view &&
        view.members.map((viewItem, idx) => {
          if (!viewItem) return null;
          return (
            <>
              <Panel>
                {viewItem.type === NodeType.TabView ? (
                  <TabView
                    activeTabId={viewItem.activeTabId}
                    direction={_direction}
                    headerControls={renderHeaderControls(viewItem)}
                    height={viewItem.height}
                    members={viewItem.members}
                    id={viewItem.id}
                    key={viewItem.id}
                    {...props}
                  />
                ) : (
                  <NestedTabView
                    direction={oppositeDirection}
                    headerControls={headerControls}
                    id={viewItem.id}
                    view={viewItem}
                    {...props}
                  />
                )}
              </Panel>
              {idx !== view.members.length - 1 && <PanelResizeHandle />}
            </>
          );
        })}
    </PanelGroup>
  );
};
