import { ITab } from './types';

//TODO: this page is still draft

export type OnAddTabHandlerHandler = (tabViewId: string, tab: ITab) => void;
export type OnCloseTabHandler = (tabViewId: string, id: string) => void;
export type OnWindowResizeHandler = (
  windowId: string,
  props: { width: number; height: number; top: number; left: number; id: string }
) => void;
export type OnWindowMoveHandler = (windowId: string, props: { top: number; left: number; id: string }) => void;
/* export type OnNothingLeftHandler = () => void;
export type OnMaximizeHandler = (id: string) => void;
export type OnMinimizeHandler = (id: string) => void;
export type OnRestoreHandler = (id: string) => void;
export type OnCloseHandler = (id: string) => void;
export type OnDetachHandler = (id: string) => void;
export type OnAttachHandler = (id: string) => void;
export type OnSplitViewHandler = (id: string, direction: Direction) => void;
export type OnMergeViewsHandler = (options: { id: string; targetId: string; beforeTabId: string }) => void;
export type OnResizeViewHandler = (direction: Direction, size: number, id: string, nextItemSize?: number) => void;
export type OnChangeTabHandler = (id: string) => void;
export type OnMoveTabHandler = (options: { tabId: string; toViewId: string; beforeTabId?: string }) => void;
 */

export interface SceneEvents {
  onAddTab?: OnAddTabHandlerHandler;
  onCloseTab?: OnCloseTabHandler;
  newTabContent?: () => JSX.Element;
  onWindowResize?: OnWindowResizeHandler;
  onWindowMove?: OnWindowMoveHandler;
  /*   onNothingLeft?: OnNothingLeftHandler;
  onMaximize?: OnMaximizeHandler;
  onMinimize?: OnMinimizeHandler;
  onRestore?: OnRestoreHandler;
  onClose?: OnCloseHandler;
  onDetach?: OnDetachHandler;
  onAttach?: OnAttachHandler;
  onSplitTabView?: OnSplitViewHandler;
  onMergeTabViews?: OnMergeViewsHandler;
  onResizeView?: OnResizeViewHandler;
  onChangeTab?: OnChangeTabHandler;
  onMoveTab?: OnMoveTabHandler; */
}
