import { Direction } from '../types';
import { ViewGroup } from './ViewGroup';

import { IGroupView, ITabView, IWindow, NodeType } from '@renderer/stores/app-store';
import { FC } from 'react';
import TabView, { TabViewCommonProps } from './TabView';

export interface NestedTabViewProps extends TabViewCommonProps {
  view: IWindow | IGroupView;
  headerControls?: {
    isVisible: (view: ITabView, viewId: string) => boolean;
    onClick: (viewId: string) => void;
    render: JSX.Element;
  }[];
}
export const NestedTabView: FC<NestedTabViewProps> = ({
  direction,
  headerControls,
  id,
  onAddNewClick,
  onResize,
  onTabChange,
  onTabClose,
  onTabMove,
  path,
  titleEditable,
  titleFormatter,
  view
}) => {
  const _direction = direction || Direction.Horizontal;
  const currentPath = [...(path || []), id];
  const oppositeDirection = _direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
  return (
    'members' in view &&
    view.members.map((viewItem: IWindow | IGroupView | ITabView) => {
      if (!viewItem) return null;
      if (viewItem.type === NodeType.TabView) {
        const activeTabId = viewItem.activeTabId;
        const renderedHeaderControls = headerControls?.map(
          (control, idx) =>
            control.isVisible(viewItem, viewItem.id) && (
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
            id={viewItem.id}
            key={viewItem.id}
            onAddNewClick={onAddNewClick}
            onResize={onResize}
            onTabChange={onTabChange}
            onTabClose={onTabClose}
            onTabMove={onTabMove}
            path={currentPath}
            members={viewItem.members}
            titleEditable={titleEditable}
            titleFormatter={titleFormatter}
            width={viewItem.width}
          />
        );
      } else {
        return (
          //TODO: move viewgroup to tabview map
          <ViewGroup
            id={viewItem.id}
            key={viewItem.id}
            direction={oppositeDirection}
            width={viewItem.width}
            height={viewItem.height}
            path={currentPath}
            onResize={onResize}
          >
            <NestedTabView
              direction={oppositeDirection}
              headerControls={headerControls}
              id={viewItem.id}
              onAddNewClick={onAddNewClick}
              onResize={onResize}
              onTabChange={onTabChange}
              onTabClose={onTabClose}
              onTabMove={onTabMove}
              path={currentPath}
              titleEditable={titleEditable}
              titleFormatter={titleFormatter}
              view={viewItem}
            />
          </ViewGroup>
        );
      }
    })
  );
};
