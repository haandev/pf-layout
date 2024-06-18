import { ITab, IWindow } from './types';

//TODO: this page is still draft

export type OnAddTabHandlerHandler = (tabViewId: string, tab: ITab, state: IWindow[]) => void;
export type OnCloseTabHandler = (tabViewId: string, id: string, state: IWindow[]) => void;
export type OnWindowResizeHandler = (
  windowId: string,
  props: { width: number; height: number; top: number; left: number },
  state: IWindow[]
) => void;
export type OnWindowMoveHandler = (windowId: string, props: { top: number; left: number }, state: IWindow[]) => void;
export type OnSceneResizeHandler = (props: { width: number; height: number }, state: IWindow[]) => void;
export type OnDetachHandler = (id: string, state: IWindow[]) => void;
export type OnMoveTabHandler = (
  tabId: string,
  options: { toViewId: string; beforeTabId?: string },
  state: IWindow[]
) => void;

/* export type OnNothingLeftHandler = () => void;
export type OnMaximizeHandler = (id: string) => void;
export type OnMinimizeHandler = (id: string) => void;
export type OnRestoreHandler = (id: string) => void;
export type OnCloseHandler = (id: string) => void;
export type OnAttachHandler = (id: string) => void;
export type OnSplitViewHandler = (id: string, direction: Direction) => void;
export type OnMergeViewsHandler = (options: { id: string; targetId: string; beforeTabId: string }) => void;
export type OnResizeViewHandler = (direction: Direction, size: number, id: string, nextItemSize?: number) => void;
export type OnChangeTabHandler = (id: string) => void;
 */

export interface SceneEvents {
  /**
   * Called when a new tab content is requested.
   * This is used to create a new tab content when a new tab is added.
   * @returns The JSX element to be used as the new tab content.
   */
  newTabContent?: () => JSX.Element;
  /**
   * Called when a new tab is added to a tab view.
   */
  onAddTab?: OnAddTabHandlerHandler;
  /**
   * Called when a tab is closed in a tab view.
   */
  onCloseTab?: OnCloseTabHandler;
  /**
   * Called when a window is resized.
   */
  onWindowResize?: OnWindowResizeHandler;
  /**
   * Called when a window is moved.
   */
  onWindowMove?: OnWindowMoveHandler;
  /**
   * Called when the scene is resized.
   */
  onSceneResize?: OnSceneResizeHandler;
  /**
   * Called when a tab view is detached.
   */
  onDetach?: OnDetachHandler;
  /**
   * Called when a tab is moved to another tab view.
   */
  onMoveTab?: OnMoveTabHandler;
  /*   onNothingLeft?: OnNothingLeftHandler;
  onMaximize?: OnMaximizeHandler;
  onMinimize?: OnMinimizeHandler;
  onRestore?: OnRestoreHandler;
  onClose?: OnCloseHandler;
  onAttach?: OnAttachHandler;
  onSplitTabView?: OnSplitViewHandler;
  onMergeTabViews?: OnMergeViewsHandler;
  onResizeView?: OnResizeViewHandler;
  onChangeTab?: OnChangeTabHandler;
  */
}
