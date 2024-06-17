import { PropsWithChildren } from 'react';
import { ContainerProps } from './blocks/Container';
import { LookupResult } from './util';

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
  ToolbarStack = 'ToolbarStack',
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
  members: IToolbarStack[];
}

export interface IToolbarStack {
  draggable?: boolean;
  type: NodeType.ToolbarStack;
  id: string;
  members: IToolbar[];
  direction: Direction;
  //undefined is default behavior (hidden in horizontal, shown in vertical)
  header?: boolean;
  maxItems?: number;
  resizable?: boolean;
  size?: number;
  as?: 'toolbar' | 'tool-tabs';
  activePanelId?: string;
  chevronsPosition?: 'start' | 'end'; //default is end
  onExpand?: () => void;
  onCollapse?: () => void;
  isExpanded?: boolean | (() => boolean);
}
export interface IToolbar {
  allowPanels?: boolean;
  columns?: number;
  content?: React.ReactNode;
  direction: Direction;
  dragHandle?: React.ReactNode;
  showHandle?: boolean;
  draggable?: boolean;
  fullSize?: boolean;
  id: string;
  maxItems?: number;
  members: IPanel[];
  rows?: number;
  type: NodeType.Toolbar;
}

export interface IPanel {
  type: NodeType.Panel;
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

export interface IContainer {
  type: NodeType.Container;
  id: string;
  members: IToolbarStack[];
  maxItems?: number;
  direction: Direction;
  chevronPosition?: 'start' | 'end'; // default is end
}

export type StateItem =
  | ITab
  | ITabView
  | IGroupView
  | IWindow
  | IToolbarWindow
  | IPanel
  | IToolbar
  | IToolbarStack
  | IContainer;
export type NestedState = StateItem | IScene | ILayout | { members: StateItem[] };

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
            : T extends IToolbarStack
              ? IContainer | IToolbarWindow
              : T extends IToolbar
                ? IToolbarStack
                : T extends IPanel
                  ? IToolbar
                  : null;

export type AsComponentProps<T extends Record<string, any>> = Partial<Omit<T, 'id' | 'type'>> & Pick<T, 'id'>;

type OptionalMembersWithoutType<T> = T extends { members: Array<infer U extends Record<string, any>> }
  ? { members?: Array<AsRegisterArgs<U>> }
  : {};

export type AsRegisterArgs<T extends Record<string, any>> = Omit<T, 'type' | 'members'> & OptionalMembersWithoutType<T>;

export interface GatheredToolbarWindow extends IToolbarWindow {
  $stack: (stack: string | AsRegisterArgs<IToolbarStack>) => Maybe<GatheredStack>;
  $props: PropsWithChildren<Pick<IToolbarWindow, 'id'>>;
  $set: (attributes: Partial<IToolbarWindow>) => void;
  $move: (xDelta: number, yDelta: number) => void;
  $close: () => void;
  $hide: () => void;
}
export interface GatheredContainer extends IContainer {
  members: GatheredStack[];
  $stack: <T extends string | AsRegisterArgs<IToolbarStack>>(
    stack: T
  ) => T extends string ? Maybe<GatheredStack> : GatheredStack;
  $props: ContainerProps;
  $set: (attributes: Partial<IContainer>) => void;
  $dropOn: (droppedItemId: string, droppedItemType: NodeType) => void;
}
export interface GatheredStack extends IToolbarStack {
  members: GatheredToolbar[];
  $toolbar: <T extends string | AsRegisterArgs<IToolbar>>(
    toolbar: T
  ) => T extends string ? Maybe<GatheredToolbar> : GatheredToolbar;
  $props: PropsWithChildren<Pick<IToolbarStack, 'id' | 'direction' | 'maxItems'>>;
  $parent?: Maybe<GatheredContainer | GatheredToolbarWindow>;
  $set: (attributes: Partial<IToolbarStack>) => void;
  $detach: (x: number, y: number) => void;
  $attach: (containerId: string) => void;
}
export interface GatheredToolbar extends IToolbar {
  //members: GatheredPanel[];
  $panel: (panel: string) => Maybe<GatheredPanel>;
  $props: PropsWithChildren<Pick<IToolbar, 'id' | 'direction' | 'maxItems'>>;
  $parent: Maybe<GatheredStack>;
  $set: (attributes: Partial<IToolbar>) => void;
}

export interface GatheredPanel extends LookupResult<IPanel> {}

export type Maybe<T> = T | null | undefined;
