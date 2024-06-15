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
  header?: React.ReactElement;
  maxItems?: number;
}

export interface IToolbar {
  draggable?: boolean;
  type: NodeType.Toolbar;
  id: string;
  members: any[];
  direction: Direction;
  dragHandle?: React.ReactNode;
  maxItems?: number;
  rows?: number;
  columns?: number;
  content?: React.ReactNode;
}

export interface IContainer {
  type: NodeType.Container;
  id: string;
  members: IToolbarStack[];
  maxItems?: number;
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

type OptionalMembersWithoutType<T> = T extends { members: Array<infer U extends Record<string, any>> } ? { members?: Array<AsRegisterArgs<U>> } : never;

export type AsRegisterArgs<T extends Record<string, any>> = Omit<T, 'type' | 'members'> & OptionalMembersWithoutType<T>;
