import { Direction, IGroupView, ITabView, IWindow, NodeType } from '../types';
import { ViewGroup } from './ViewGroup';

import { FC } from 'react';
import TabView, { TabViewCommonProps } from './TabView';
import { evalBoolean } from '../util';
import { SceneStore } from '../stores/scene-store';

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
    'members' in view &&
    view.members.map((viewItem: IWindow | IGroupView | ITabView) => {
      if (!viewItem) return null;
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
        return (
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
        );
      } else {
        return (
          //TODO: move viewgroup to tabview map
          <ViewGroup store={props.store} id={viewItem.id} key={viewItem.id} direction={oppositeDirection} width={viewItem.width} height={viewItem.height}>
            <NestedTabView direction={oppositeDirection} headerControls={headerControls} id={viewItem.id} view={viewItem} {...props} />
          </ViewGroup>
        );
      }
    })
  );
};
