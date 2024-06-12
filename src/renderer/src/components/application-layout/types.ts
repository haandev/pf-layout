import { FC } from 'react';

export enum Direction {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}
export enum StackType {
  Toolbar = 'toolbar-stack',
  Window = 'window-stack'
}
export enum ToolbarItemType {
  Button = 'toolbar-button',
  Separator = 'toolbar-separator',
  Text = 'toolbar-text',
  IconButton = 'toolbar-icon-button',
  StickyIconButton = 'toolbar-sticky-icon-button'
}
export enum Lock {
  InternalFree = 'internal-free',
  Locked = 'locked'
}
export enum NodeType {
  Tile = 'tile',
  Container = 'container',
  WindowContainer = 'window-container'
}

export type Tile = {
  /**
   * If not provided, item is always visible
   * @returns {boolean}
   */
  isVisible?: boolean | (() => boolean);
  type: NodeType.Tile;
  direction: Direction;
  children: Container[];
  lockItems?: Lock;
};

export type ContainerDefaults = {
  /**
   * If not provided, item is always visible
   * @returns {boolean}
   */
  isVisible?: boolean | (() => boolean);
  name: string;
  direction: Direction;
  disableHorizontalParent?: boolean;
  disableVerticalParent?: boolean;
  grow?: boolean;
  children: Stack[];
  lockItems?: Lock;
};
export type ContainerHorizontal = ContainerDefaults & {
  direction: Direction.Horizontal;
  children: StackOnlyHorizontalParentsAllowed[];
};
export type ContainerVertical = ContainerDefaults & {
  direction: Direction.Vertical;
  children: StackOnlyVerticalParentsAllowed[];
};
export type Container = ContainerHorizontal | ContainerVertical;

export type StackDefaults = {
  /**
   * If not provided, item is always visible
   * @returns {boolean}
   */
  isVisible?: boolean | (() => boolean);
  name?: string;
  type: StackType;
  direction: Direction;
  disableHorizontalParent?: boolean;
  disableVerticalParent?: boolean;
  lockItems?: Lock;
  lockSelf?: Lock;
  disableFree?: boolean;
  disableTile?: boolean;
  grow?: boolean;
  additionalProps?: Record<string, any>;
};
export type ToolbarStackHeaderButton = {
  isVisible?: boolean | ((stack: ToolbarStack) => boolean);
  icon: FC<React.SVGProps<SVGSVGElement>>;
  onClick: (stack: ToolbarStack, sender: ToolbarStackHeaderButton) => void;
};
export type ToolbarStackDefaults = StackDefaults & {
  type: StackType.Toolbar;
  children: Toolbar[];
  header?: {
    isVisible?: boolean | (() => boolean);
    leftButtons?: ToolbarStackHeaderButton[];
    rightButtons?: ToolbarStackHeaderButton[];
  };
};
export type ToolbarStackHorizontal = ToolbarStackDefaults & {
  direction: Direction.Horizontal;
  children: ToolbarOnlyHorizontalParentsAllowed[];
};
export type ToolbarStackVertical = ToolbarStackDefaults & {
  direction: Direction.Vertical;
  children: ToolbarOnlyVerticalParentsAllowed[];
};
export type ToolbarStack = ToolbarStackHorizontal | ToolbarStackVertical;

export type ToolbarDefaults = {
  /**
   * If not provided, item is always visible
   * @returns {boolean}
   */
  isVisible?: boolean | (() => boolean);
  name: string;
  lockItems?: Lock;
  lockSelf?: Lock;
  disableHorizontalParent?: boolean;
  disableVerticalParent?: boolean;
  direction: Direction;
  items: ToolbarItem[];
  rows?: number;
  columns?: number;
};
export type ToolbarMultiRow = ToolbarDefaults & {
  rows: number;
  columns?: never;
  direction: Direction.Horizontal;
};
export type ToolbarMultiColumn = ToolbarDefaults & {
  columns: number;
  rows?: never;
  direction: Direction.Vertical;
};

export type ToolbarEssential = ToolbarMultiRow | Toolbar;
export type ToolbarHorizontal = ToolbarDefaults & {
  items: ToolbarItemOnlyHorizontalParentsAllowed[];
  direction: Direction.Horizontal;
};
export type ToolbarVertical = ToolbarDefaults & {
  items: ToolbarItemOnlyVerticalParentsAllowed[];
  direction: Direction.Vertical;
};

export type Toolbar = ToolbarHorizontal | ToolbarVertical;

export type ToolbarOnlyHorizontalParentsAllowed = Toolbar & {
  disableHorizontalParent?: false;
};
export type ToolbarOnlyVerticalParentsAllowed = Toolbar & {
  disableVerticalParent?: false;
};

export type ToolbarItemDefaults = {
  /**
   * If not provided, item is always visible
   * @returns {boolean}
   */
  isVisible?: boolean | (() => boolean);
  alignToEnd?: boolean;
  disableHorizontalParent?: boolean;
  disableVerticalParent?: boolean;
  lockSelf?: Lock;
  onClick?: () => void;
};

export type ToolbarButtonItem = ToolbarItemDefaults & {
  type: ToolbarItemType.Button;
  label: string;
};
export type ToolbarSeparatorItem = ToolbarItemDefaults & {
  type: ToolbarItemType.Separator;
};
export type ToolbarTextItem = ToolbarItemDefaults & {
  type: ToolbarItemType.Text;
  text: string;
};
export type ToolbarIconButtonItem = ToolbarItemDefaults & {
  type: ToolbarItemType.IconButton;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  label: string;
};
export type ToolbarStickyIconButtonItem = ToolbarItemDefaults & {
  type: ToolbarItemType.StickyIconButton;
  groupTag: string;
  buttonTag: string;
  visibleOne?: number;
  items: {
    icon: FC<React.SVGProps<SVGSVGElement>>;
    label: string;
    name: string;
  }[];
};

export type ToolbarItem = ToolbarButtonItem | ToolbarSeparatorItem | ToolbarTextItem | ToolbarIconButtonItem | ToolbarStickyIconButtonItem;

export type ToolbarItemOnlyHorizontalParentsAllowed = ToolbarItem & {
  disableHorizontalParent?: false;
};
export type ToolbarItemOnlyVerticalParentsAllowed =
  | (ToolbarItem & {
      disableVerticalParent?: false;
    })
  | ToolbarSeparatorItem
  | ToolbarIconButtonItem;

export type WindowStackDefaults = StackDefaults & {
  type: StackType.Window;
};
export type WindowStackHorizontal = WindowStackDefaults & {
  direction: Direction.Horizontal;
  children: ToolbarOnlyHorizontalParentsAllowed[];
};

export type WindowStackVertical = WindowStackDefaults & {
  direction: Direction.Vertical;
  children: Window[];
};
export type WindowStack = WindowStackHorizontal | WindowStackVertical;
export type WindowItem = {
  /**
   * If not provided, item is always visible
   * @returns {boolean}
   */
  isVisible?: boolean | (() => boolean);
  name: string;
  title: string;
  element: React.ReactNode;
};
export type MainContent = Tile | WindowStack;
export type Stack = ToolbarStack | MainContent;

export type StackOnlyHorizontalParentsAllowed = Stack & {
  disableHorizontalParent?: false;
};
export type StackOnlyVerticalParentsAllowed = Stack & {
  disableVerticalParent?: false;
};
export interface LayoutDefinition {
  tile: Tile;
  free: Stack[];
}

export type { UseBoxResizeHandler } from './hooks/use-box-resize';
