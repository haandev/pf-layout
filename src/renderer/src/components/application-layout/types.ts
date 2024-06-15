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
  ToolbarStackGroup = 'ToolbarStackGroup'
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
  members: IToolbarStackGroup[];
} & { [key: string]: any };
export interface IToolbarStackGroup {
  type: NodeType.ToolbarStackGroup;
  id: string;
  floating?: boolean;
  top?: number;
  left?: number;
  hidden?: boolean;
  zIndex?: number;
}

export type StateItem = ITab | ITabView | IGroupView | IWindow | IToolbarStackGroup;
export type NestedState = StateItem | IScene | ILayout;

export type ParentType<T> = T extends ITab
  ? ITabView
  : T extends ITabView
    ? IGroupView
    : T extends IGroupView
      ? IWindow | IGroupView
      : T extends IWindow
        ? IScene
        : T extends IToolbarStackGroup
          ? ILayout
          : null;

export type AsComponentProps<T extends Record<string, any>> = Partial<Omit<T, 'id' | 'type'>> & Pick<T, 'id'>;
