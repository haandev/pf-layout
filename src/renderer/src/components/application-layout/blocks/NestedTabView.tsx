import { TabItem, ContainerView } from '@renderer/stores/app-store';
import { Direction } from '../types';
import { FC } from 'react';
import TabView, { IsActiveHandler, OnAddNewClickHandler, OnSplitResizeHandler, OnTabChangeHandler, OnTabCloseHandler, OnTabMoveHandler } from './TabView';
import { ViewGroup } from './ViewGroup';

export interface NestedTabViewProps {
  view: ContainerView;
  direction?: Direction;

  onTabChange?: OnTabChangeHandler;
  onTabClose?: OnTabCloseHandler;
  onResize?: OnSplitResizeHandler;
  isActive?: IsActiveHandler;

  headerControls?: {
    isVisible: (tabs: Record<string, TabItem>, viewPath: string[]) => boolean;
    onClick: (viewPath: string[]) => void;
    render: JSX.Element;
  }[];

  onAddNewClick?: OnAddNewClickHandler;
  onTabMove?: OnTabMoveHandler;

  id: string; //path member
  //don't call directly, used for recursion
  path?: string[];
}
export const NestedTabView: FC<NestedTabViewProps> = ({
  view,
  direction,
  path,
  onTabChange,
  onTabClose,
  headerControls,
  onAddNewClick,
  onTabMove,
  onResize,
  id
}) => {
  const _direction = direction || Direction.Horizontal;
  const currentPath = [...(path || []), id];
  const oppositeDirection = _direction === Direction.Horizontal ? Direction.Vertical : Direction.Horizontal;
  return (
    view.views &&
    Object.entries(view.views).map(([_id, viewItem]) => {
      const nextPath = [...(currentPath || []), _id];
      const pathKey = nextPath.join('/');
      if (!viewItem) return null;
      if ('tabs' in viewItem) {
        const activeTabId = viewItem.activeTabId;
        const renderedHeaderControls = headerControls?.map(
          (control, idx) =>
            control.isVisible(viewItem.tabs, nextPath) && (
              <button key={idx} className="pf-tab-header-button" onClick={() => control.onClick(nextPath)}>
                {control.render}
              </button>
            )
        );
        return (
          <TabView
            id={_id}
            direction={_direction}
            onResize={onResize}
            key={pathKey}
            path={currentPath}
            tabs={viewItem.tabs}
            activeTabId={activeTabId}
            onTabChange={onTabChange}
            onTabClose={onTabClose}
            onTabMove={onTabMove}
            onAddNewClick={onAddNewClick}
            headerControls={!!renderedHeaderControls?.length && renderedHeaderControls}
            width={viewItem.width}
            height={viewItem.height}
          />
        );
      } else {
        return (
          //TODO: move viewgroup to tabview map
          <ViewGroup
            id={_id}
            key={pathKey}
            direction={oppositeDirection}
            width={viewItem.width}
            height={viewItem.height}
            path={currentPath}
            onResize={onResize}
          >
            <NestedTabView
              id={_id}
              onResize={onResize}
              onTabMove={onTabMove}
              view={viewItem}
              direction={oppositeDirection}
              path={currentPath}
              onTabChange={onTabChange}
              onTabClose={onTabClose}
              headerControls={headerControls}
              onAddNewClick={onAddNewClick}
            />
          </ViewGroup>
        );
      }
    })
  );
};
