import { PropsWithChildren } from 'react';
import { ContainerProps } from './blocks/scene/Container';
import { StackProps } from './blocks/layout/Stack';
import { ToolbarProps } from './blocks/layout/Toolbar';

//util
export type Maybe<T> = T | null | undefined;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type AsComponentProps<T extends Record<string, any>> = Partial<Omit<T, 'id' | 'type'>> & Pick<T, 'id'>;
export type OptionalMembersWithoutType<T> = T extends { members: Array<infer U extends Record<string, any>> }
  ? { members?: Array<AsRegisterArgs<U>> }
  : {};
export type AsRegisterArgs<T extends Record<string, any>> = Omit<T, 'type' | 'members' | 'content'> &
  Partial<Pick<T, 'type' | 'content'>> &
  OptionalMembersWithoutType<T>;

export enum Direction {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}
export enum NodeType {
  App = 'App',
  Tab = 'Tab',
  TabView = 'TabView',
  GroupView = 'GroupView',
  Window = 'Window',
  Stack = 'Stack',
  ToolbarWindow = 'ToolbarWindow',
  Container = 'Container',
  Toolbar = 'Toolbar',
  Panel = 'Panel'
}
export interface ITab {
  type: NodeType.Tab;
  id: string;
  title: string;
  content: React.ReactNode;
  recentlyCreated: boolean;
}
export interface ITabView {
  type: NodeType.TabView;
  id: string;
  members: ITab[];
  activeTabId?: string;
  width?: number;
  height?: number;
}
export interface IGroupView {
  type: NodeType.GroupView;
  id: string;
  members: (IGroupView | ITabView)[];
  width?: number;
  height?: number;
}
export type IWindow = {
  type: NodeType.Window;
  id: string;
  members: IGroupView[];
  floating?: boolean;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  minimized?: boolean;
  maximized?: boolean;
  previousPosition?: { top: number; left: number; width?: number; height?: number };
  zIndex?: number;
};
export type IScene = {
  members: IWindow[];
} & { [key: string]: any };
export type ILayout = {
  members: IContainer[];
} & { [key: string]: any };
export interface IToolbarWindow {
  type: NodeType.ToolbarWindow;
  id: string;
  top?: number;
  left?: number;
  hidden?: boolean;
  zIndex?: number;
  members: IStack[];
}
export interface IStack {
  activePanelId?: string;
  as?: 'toolbar' | 'tabs';
  chevronsPosition?: 'start' | 'end'; //default is end
  direction: Direction;
  draggable?: boolean;
  header?: boolean; //undefined is default behavior (hidden in horizontal, shown in vertical)
  id: string;
  isExpanded?: boolean | (() => boolean);
  maxItems?: number;
  members: IToolbar[];
  onCollapse?: (stackInstance?: GatheredStack | null) => void;
  onExpand?: (stackInstance?: GatheredStack | null) => void;
  resizable?: boolean;
  size?: number;
  type: NodeType.Stack;
  width?: number;
}
export interface IToolbar {
  allowPanels?: boolean;
  columns?: number;
  content?: React.ReactNode;
  direction: Direction;
  dragHandle?: React.ReactNode;
  draggable?: boolean;
  fullSize?: boolean;
  id: string;
  lastUsedPanelId?: string;
  maxItems?: number;
  members: IPanel[];
  rows?: number;
  showHandle?: boolean;
  type: NodeType.Toolbar;
}
export interface IPanel {
  type: NodeType.Panel;
  id: string;
  icon: React.ReactNode;
  title: string;
  compactContent?: React.ReactNode;
  content: React.ReactNode;
  contextMenu?: ContextMenu;
  visibility?: 'full' | 'compact' | 'collapsed';
}

export interface IContainer {
  type: NodeType.Container;
  maxItems?: number;
  id: string;
  members: IStack[];
  direction: Direction;
  chevronPosition?: 'start' | 'end'; // default is end
  canDrop?: (source: IStack, target: IContainer) => boolean;
}
export type StateItem =
  | ITab
  | ITabView
  | IGroupView
  | IWindow
  | IToolbarWindow
  | IPanel
  | IToolbar
  | IStack
  | IContainer;

export type NestedState = StateItem | IScene | ILayout | { members: StateItem[] };

//explains parent type of known type
export type ParentType<T> = T extends ITab
  ? ITabView
  : T extends ITabView
    ? IGroupView
    : T extends IGroupView
      ? IWindow | IGroupView
      : T extends IWindow
        ? IScene
        : T extends IToolbarWindow
          ? ILayout
          : T extends IContainer
            ? ILayout
            : T extends IStack
              ? IContainer | IToolbarWindow
              : T extends IToolbar
                ? IStack
                : T extends IPanel
                  ? IToolbar
                  : null;

export interface GatheredToolbarWindow extends IToolbarWindow {
  $stack: (stack: string | AsRegisterArgs<IStack>) => Maybe<GatheredStack>;
  $props: PropsWithChildren<Pick<IToolbarWindow, 'id'>>;
  $set: (attributes: Partial<IToolbarWindow>) => void;
  $move: (xDelta: number, yDelta: number) => void;
  $close: () => void;
  $hide: () => void;
}
export interface GatheredContainer extends IContainer {
  members: GatheredStack[];
  $stack: <T extends string | AsRegisterArgs<IStack>>(
    stack: T
  ) => T extends string ? Maybe<GatheredStack> : GatheredStack;
  $props: ContainerProps;
  $set: (attributes: Partial<IContainer>) => void;
  $dropOn: (droppedItemId: string, droppedItemType: NodeType) => void;
}
export interface GatheredStack extends IStack {
  members: GatheredToolbar[];
  $toolbar: <T extends string | AsRegisterArgs<IToolbar>>(
    toolbar: T
  ) => T extends string ? Maybe<GatheredToolbar> : GatheredToolbar;
  $props: StackProps;
  $parent?: Maybe<GatheredContainer | GatheredToolbarWindow>;
  $set: (attributes: Partial<IStack>) => void;
  $detach: (x: number, y: number) => void;
  $attach: (containerId: string) => void;
  $asTabs: () => void;
  $asToolbar: () => void;
}
export interface GatheredToolbar extends IToolbar {
  members: GatheredPanel[];
  // $panel: (panel: string) => Maybe<GatheredPanel>;
  $panel: <T extends string | AsRegisterArgs<IPanel>>(
    panel: T
  ) => T extends string ? Maybe<GatheredPanel> : GatheredPanel;
  $props: ToolbarProps;
  $parent: Maybe<GatheredStack>;
  $set: (attributes: Partial<IToolbar>) => void;
}

export interface GatheredPanel extends IPanel {
  $toggleVisibility: (as:"tabs" | "toolbar") => void;
}

export interface GatheredWindow extends IWindow {
  members: GatheredGroupView[];
  $group: <T extends string | AsRegisterArgs<IGroupView>>(
    group: T
  ) => T extends string ? Maybe<GatheredGroupView> : GatheredGroupView;
  $set: (attributes: Partial<IWindow>) => void;
  $move: (xDelta: number, yDelta: number) => void;
  $close: () => void;
  $resize: (width: number, height: number, top: number, left: number) => void;
  $maximize: () => void;
  $minimize: () => void;
  $restore: () => void;
  $bringToFront: () => void;
}

export interface GatheredGroupView extends IGroupView {
  members: (GatheredTabView | GatheredGroupView)[];
  $tabView: <T extends string | AsRegisterArgs<ITabView>>(
    tabView: T
  ) => T extends string ? Maybe<GatheredTabView> : GatheredTabView;
  $subGroupView: <T extends string | AsRegisterArgs<IGroupView>>(
    subGroupView: T
  ) => T extends string ? Maybe<GatheredGroupView> : GatheredGroupView;
  $anyChildrenView: <T extends string | AsRegisterArgs<IGroupView> | AsRegisterArgs<ITabView>>(
    childView: T
  ) => T extends string
    ? Maybe<GatheredGroupView | GatheredTabView>
    : T extends AsRegisterArgs<IGroupView>
      ? GatheredGroupView
      : T extends AsRegisterArgs<ITabView>
        ? GatheredTabView
        : undefined;
  $parent: Maybe<GatheredWindow | GatheredGroupView>;
  $set: (attributes: Partial<IGroupView>) => void;
}

export interface GatheredTabView extends ITabView {
  members: GatheredTab[];
  $tab: <T extends string | AsRegisterArgs<ITab>>(tab: T) => T extends string ? Maybe<GatheredTab> : GatheredTab;
  $parent: Maybe<GatheredGroupView>;
  $set: (attributes: Partial<ITabView>) => void;
  $detach: (x: number, y: number) => void;
  $attach: () => void;
  $addTab: (tab: PartialBy<AsRegisterArgs<ITab>, 'id' | 'content' | 'title'>) => void;
  $changeActiveTab: (tabId: string) => void;
  $split: (direction: Direction) => void;
  $closeTab: (tabId: string) => void;
  $moveTabToView: (tabId: string, beforeTabId?: string) => void;
}

export interface GatheredTab extends ITab {
  $parent: Maybe<GatheredTabView>;
  $set: (attributes: Partial<ITab>) => void;
}

export type IPageProps = {
  id: string;
};

export type ContextMenuItem =
  | ContextMenu
  | {
      title: string;
      id: string;
      checked: boolean | (() => boolean);
      disabled: boolean | (() => boolean);
      children: ContextMenu;
    };

export type ContextMenu = ContextMenuItem[];
