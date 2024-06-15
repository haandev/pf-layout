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
  FloatingToolbarWindow = 'FloatingToolbarWindow',
  Container = 'Container',
  Toolbar = 'Toolbar'
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

export interface IFloatingToolbarWindow {
  type: NodeType.FloatingToolbarWindow;
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
  header?: React.ReactElement | (() => React.ReactElement);
  maxItems?: number;
  resizable?: boolean;
  size?: number;
  as?: 'toolbar' | 'tool-tabs';
  activeFloatingToolId?: string;
}
export interface IToolbar {
  allowFloatingTools?: boolean;
  columns?: number;
  content?: React.ReactNode;
  direction: Direction;
  dragHandle?: React.ReactNode;
  draggable?: boolean;
  fullSize?: boolean;
  id: string;
  maxItems?: number;
  members: IFloatingTool[];
  rows?: number;
  type: NodeType.Toolbar;
}

export interface IFloatingTool {
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
}

export type StateItem = ITab | ITabView | IGroupView | IWindow | IFloatingToolbarWindow | IToolbar | IToolbarStack | IContainer;
export type NestedState = StateItem | IScene | ILayout;

export type ParentType<T> = T extends ITab
  ? ITabView
  : T extends ITabView
    ? IGroupView
    : T extends IGroupView
      ? IWindow | IGroupView
      : T extends IWindow
        ? IScene
        : T extends IFloatingToolbarWindow
          ? ILayout
          : T extends IContainer
            ? ILayout
            : T extends IToolbarStack
              ? IContainer | IFloatingToolbarWindow
              : T extends IToolbar
                ? IToolbarStack
                : null;

export type AsComponentProps<T extends Record<string, any>> = Partial<Omit<T, 'id' | 'type'>> & Pick<T, 'id'>;

type OptionalMembersWithoutType<T> = T extends { members: Array<infer U extends Record<string, any>> } ? { members?: Array<AsRegisterArgs<U>> } : {};

export type AsRegisterArgs<T extends Record<string, any>> = Omit<T, 'type' | 'members'> & OptionalMembersWithoutType<T>;
