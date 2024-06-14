import { OnResize } from 'reactflow';
import { Direction, ITab } from './types';

//TODO: this page is still draft

export type OnAddTabHandlerHandler = (tabViewId: string, tab: Omit<ITab, 'type' | 'id' | 'title'> & { id?: string; title?: string }) => void;
export type OnCloseTabHandler = (id: string) => void;
/* export type OnNothingLeftHandler = () => void;
export type OnWindowResizeHandler = (width: number, height: number, top: number, left: number, id: string) => void;
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
  /*   onNothingLeft?: OnNothingLeftHandler;
  onWindowResize?: OnWindowResizeHandler;
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
