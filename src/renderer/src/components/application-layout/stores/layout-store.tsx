import { create } from 'zustand';
import { lookUp } from '../util';
import {
  AsRegisterArgs,
  Direction,
  GatheredContainer,
  IContainer,
  IPanel,
  IToolbarWindow,
  IToolbar,
  IStack,
  NodeType,
  GatheredStack,
  Maybe,
  GatheredToolbar,
  GatheredToolbarWindow
} from '../types';
import { isContainer, isToolbarWindow, isToolbar, isStack, isString } from '../guards';
import { PropsWithChildren } from 'react';
import { Stack } from '../blocks/Stack';
import { Toolbar } from '../blocks/Toolbar';
import { v4 } from 'uuid';
import { ContainerProps } from '../blocks/Container';
import Panel from '../blocks/Panel';

export interface LayoutStore {
  members: IContainer[];
  floating: IToolbarWindow[];

  /**
   * Retrieves a container with the given id or creates a new one if it doesn't exist.
   * To create a new container, pass an object with the container's properties.
   * @param toolbarWindow - The id of the toolbarWindow or an object with the toolbarWindow's properties.
   * @returns The GatheredToolbarWindow that also has the methods to manipulate the toolbarWindow.
   */
  $toolbarWindow: <T extends string | AsRegisterArgs<IToolbarWindow>>(
    toolbarWindow: T
  ) => T extends string ? Maybe<GatheredToolbarWindow> : GatheredToolbarWindow;

  /**
   * Retrieves a container with the given id or creates a new one if it doesn't exist.
   * To create a new container, pass an object with the container's properties.
   * @param container - The id of the container or an object with the container's properties.
   * @returns The GatheredContainer that also has the methods to manipulate the container.
   */
  $container: <T extends string | AsRegisterArgs<IContainer>>(
    container: T
  ) => T extends string ? Maybe<GatheredContainer> : GatheredContainer;

  /**
   * Retrieves a container with the given id or creates a new one if it doesn't exist.
   * To create a new container, pass an object with the container's properties.
   * @param stack - The id of the stack or an object with the stack's properties.
   * @param hostId - The id of the container where the stack will be placed.
   * @returns The GatheredStack that also has the methods to manipulate the stack.
   */
  $stack: <T extends string | AsRegisterArgs<IStack>>(
    stack: T,
    hostId?: string
  ) => T extends string ? Maybe<GatheredStack> : GatheredStack;

  /**
   * Retrieves a container with the given id or creates a new one if it doesn't exist.
   * To create a new container, pass an object with the container's properties.
   * @param toolbar - The id of the toolbar or an object with the toolbar's properties.
   * @param stack - The id of the stack where the toolbar will be placed.
   * @returns The GatheredToolbar that also has the methods to manipulate the toolbar.
   */
  $toolbar: <T extends string | AsRegisterArgs<IToolbar>>(
    toolbar: T,
    stack?: string
  ) => T extends string ? Maybe<GatheredToolbar> : GatheredToolbar;
}

export const useLayout = create<LayoutStore>((set, get) => {
  const both = () => ({ members: [...get().members, ...get().floating] });
  //props generation
  const toolbarWindowProps = (item: IToolbarWindow) => {
    const children = item.members.map((stack) => {
      const childrenProps = stackProps(stack);
      return (
        <Stack
          onClose={() => {
            const parent = get().$stack(stack.id)?.$parent;
            if (parent?.type === NodeType.ToolbarWindow) return parent.$hide();
          }}
          {...childrenProps}
          parentId={item.id}
          key={stack.id}
        />
      );
    });

    const props: PropsWithChildren<Pick<IToolbarWindow, 'id' | 'top' | 'left' | 'zIndex' | 'hidden'>> = {
      id: item.id,
      top: item.top || 0,
      left: item.left || 0,
      zIndex: item.zIndex || 0,
      hidden: item.hidden || false,
      children
    };
    return props;
  };
  const containerProps = (item: IContainer): ContainerProps => {
    const children = item.members.map((stack) => {
      const childrenProps = stackProps(stack);
      return <Stack {...childrenProps} chevronsPosition={item.chevronPosition} parentId={item.id} key={stack.id} />;
    });

    const props: ContainerProps = {
      ...item,
      onDrop: (id: string, type: NodeType, containerId: string) => {
        get().$container(containerId)?.$dropOn(id, type);
      },
      children: children
    };
    return props;
  };
  const stackProps = (item: IStack) => {
    const children = item.members.map((toolbar) => {
      const childrenProps = toolbarProps(toolbar, item);
      return <Toolbar {...childrenProps} key={toolbar.id} />;
    });
    const props: PropsWithChildren<Pick<IStack, 'id' | 'direction' | 'maxItems'>> = { ...item, children };
    return props;
  };
  const toolbarProps = (item: IToolbar, parent: IStack) => {
    const onClickHandler = (id: string) => {
      set((state) => {
        const members = [...state.members];
        const floating = [...state.floating];
        if (!isStack(parent)) return { members, floating };
        parent.activePanelId = id;
        return { members, floating };
      });
    };
    const children = item.members.map((tool) => {
      return <Panel key={tool.id} {...tool} value={parent?.activePanelId} onClick={() => onClickHandler(tool.id)} />;
    });

    const props: PropsWithChildren<Pick<IToolbar, 'id' | 'direction'>> = {
      ...item,
      children: [item.content, children]
    };
    return props;
  };

  //members generation
  const toolbarWindowMembers = (toolbarWindow: AsRegisterArgs<IToolbarWindow>): GatheredStack[] => {
    const typedMembers = (toolbarWindow.members || []).map((stack) => ({
      ...stack,
      type: NodeType.Stack as NodeType.Stack,
      members: stackMembers(stack)
    }));
    const typedWindow = {
      ...toolbarWindow,
      type: NodeType.ToolbarWindow as NodeType.ToolbarWindow,
      members: typedMembers
    };
    return typedMembers.map((stack) => getStack(stack, typedWindow));
  };
  const containerMembers = (container: AsRegisterArgs<IContainer>): GatheredStack[] => {
    const typedMembers = (container.members || []).map((stack) => ({
      ...stack,
      type: NodeType.Stack as NodeType.Stack,
      members: stackMembers(stack)
    }));
    const typedContainer = {
      ...container,
      type: NodeType.Container as NodeType.Container,
      members: typedMembers
    };
    return typedMembers.map((stack) => getStack(stack, typedContainer));
  };
  const stackMembers = (stack: AsRegisterArgs<IStack>): GatheredToolbar[] => {
    const typedMembers = (stack.members || []).map((toolbar) => ({
      ...toolbar,
      type: NodeType.Toolbar as NodeType.Toolbar,
      members: toolbarMembers(toolbar)
    }));
    const typedStack = { ...stack, type: NodeType.Stack as NodeType.Stack, members: typedMembers };
    return typedMembers.map((toolbar) => getToolbar(toolbar, typedStack));
  };
  const toolbarMembers = (toolbar: AsRegisterArgs<IToolbar>): IPanel[] => {
    return (toolbar.members || []).map((tool) => ({ type: NodeType.Panel, content: tool.content || null, ...tool }));
  };

  //gather item with methods
  const getContainer = (container?: IContainer): GatheredContainer => {
    if (!container) {
      container = {
        type: NodeType.Container,
        id: '',
        members: [],
        direction: Direction.Vertical
      };
    }
    return {
      ...container,
      get members() {
        return containerMembers(container);
      },
      get $props() {
        return containerProps(container);
      },
      $stack: (stack) => get().$stack(stack, container.id),
      $set: (attributes) => {
        set((state) => {
          const members = [...state.members];
          const item = members.find((item) => item.id === container.id);
          if (!isContainer(item)) return state;
          Object.assign(item, attributes);
          return { members };
        });
      },
      $dropOn: (droppedItemId, droppedItemType) => {
        set((state) => {
          const members = [...state.members];
          if (droppedItemType === NodeType.Stack) {
            get().$stack(droppedItemId)?.$attach(container.id);
          } else if (droppedItemType === NodeType.ToolbarWindow) {
            const toolbarWindow = get().$toolbarWindow(droppedItemId);
            if (!toolbarWindow) return state;
            container.members.push(...toolbarWindow.members);
            toolbarWindow.$close();
          }
          return { members };
        });
      }
    };
  };
  const getToolbarWindow = (toolbarWindow?: IToolbarWindow): GatheredToolbarWindow => {
    if (!toolbarWindow) toolbarWindow = { type: NodeType.ToolbarWindow, id: v4(), members: [] };
    return {
      ...toolbarWindow,
      get $props() {
        return toolbarWindowProps(toolbarWindow);
      },
      $stack: (stack) => get().$stack(stack, toolbarWindow.id),
      $set: (attributes) => {
        set((state) => {
          const floating = [...state.floating];
          const item = floating.find((item) => item.id === toolbarWindow.id);
          if (!isToolbarWindow(item)) return state;
          Object.assign(item, attributes);
          return { floating };
        });
      },
      $move: (xDelta, yDelta) => {
        console.log('move');
        return set((state) => {
          const floating = [...state.floating];
          toolbarWindow.top = (toolbarWindow.top || 0) + yDelta;
          toolbarWindow.left = (toolbarWindow.left || 0) + xDelta;
          return { floating };
        });
      },
      $close: () => {
        return set((state) => {
          const floating = state.floating.filter((tw) => tw.id !== toolbarWindow.id);
          return { floating };
        });
      },
      $hide: () => {
        return set((state) => {
          const floating = [...state.floating];
          toolbarWindow.hidden = true;
          return { floating };
        });
      }
    };
  };
  const getStack = (stack: IStack, parent?: IToolbarWindow | IContainer): GatheredStack => {
    return {
      ...stack,
      get members() {
        return stackMembers(stack);
      },
      get $props() {
        return stackProps(stack);
      },
      get $parent() {
        return parent ? (isContainer(parent) ? get().$container(parent) : get().$toolbarWindow(parent)) : undefined;
      },
      $toolbar: (toolbar) => get().$toolbar(toolbar, stack.id),
      $set: (attributes) => {
        set((state) => {
          const members = [...state.members];
          const floating = [...state.floating];
          Object.assign(stack, attributes);
          return { members, floating };
        });
      },
      $detach: (x, y) => {
        set((state) => {
          const members = [...state.members];
          const floating = [...state.floating];
          const { parent } = lookUp<IStack>(both(), stack.id);
          if (!parent) return state;
          parent.members = parent.members.filter((item) => item.id !== stack.id);
          const newToolbarWindow: IToolbarWindow = {
            type: NodeType.ToolbarWindow,
            id: v4(),
            members: [stack],
            top: y,
            left: x
          };
          floating.push(newToolbarWindow);
          return { members, floating: floating.filter((item) => item.members.length > 0) };
        });
      },
      $attach: (containerId) => {
        set((state) => {
          const members = [...state.members];
          const floating = [...state.floating];
          const { item: container } = lookUp<IContainer>(state, containerId);
          const { parent } = lookUp<IStack>(both(), stack.id);
          if (!isContainer(container)) return state;
          parent && (parent.members = parent.members.filter((item) => item.id !== stack.id));
          container.members.push(stack);
          return { members, floating };
        });
      }
    };
  };
  const getToolbar = (toolbar: IToolbar, parent: IStack): GatheredToolbar => {
    return {
      ...toolbar,
      get $props() {
        return toolbarProps(toolbar, parent);
      },
      get $parent() {
        return get().$stack(parent);
      },
      $panel: (panel) => lookUp<IPanel>(both(), panel).item,
      $set: (attributes) => {
        set((state) => {
          const members = [...state.members];
          const item = lookUp<IToolbar>(both(), toolbar.id).item;
          if (!isToolbar(item)) return state;
          Object.assign(item, attributes);
          return { members };
        });
      }
    };
  };

  return {
    members: [],
    floating: [],

    $toolbarWindow: (toolbarWindow) => {
      if (typeof toolbarWindow === 'string') {
        const { item } = lookUp<IToolbarWindow>(get().floating, toolbarWindow);
        if (item) return getToolbarWindow(item);
        return undefined as any; //default empty toolbar window
      } else {
        const { item } = lookUp<IToolbarWindow>(get().floating, toolbarWindow.id);
        if (item) return getToolbarWindow(item);
        const newToolbarWindow: IToolbarWindow = {
          type: NodeType.ToolbarWindow,
          ...toolbarWindow,
          members: toolbarWindowMembers(toolbarWindow)
        };
        set((state) => {
          const floating = [...state.floating];
          floating.push(newToolbarWindow);
          return { floating };
        });
        return getToolbarWindow(newToolbarWindow);
      }
    },
    $container: (container) => {
      if (typeof container === 'string') {
        const { item } = lookUp<IContainer>(get(), container);
        if (item) return getContainer(item);
        return undefined as any; //possibly typescript issue
      } else {
        const { item } = lookUp<IContainer>(get(), container.id);
        if (item) return getContainer(item);
        const newContainer: IContainer = {
          type: NodeType.Container,
          ...container,
          members: containerMembers(container)
        };
        set((state) => {
          const members = [...state.members];
          members.push(newContainer);
          return { members };
        });
        return getContainer(newContainer);
      }
    },
    $stack: (stack, hostId) => {
      if (isString(stack)) {
        const { item, parent } = lookUp<IStack>(both(), stack);
        if (item && parent) return getStack(item, parent);
        return undefined as any;
      } else {
        const { item, parent } = lookUp<IStack>(both(), stack.id);
        if (item && parent) return getStack(item, parent);
        const { item: host } = lookUp<IContainer>(both(), hostId);
        if (!isContainer(host) && !isToolbarWindow(host)) throw new Error('Invalid host');

        const newStack: IStack = { type: NodeType.Stack, ...stack, members: stackMembers(stack) };
        set((state) => {
          const members = [...state.members];
          host.members.push(newStack);
          return { members };
        });
        return getStack(newStack, host);
      }
    },
    $toolbar: (toolbar, stack) => {
      //potential best solution for this type of operations
      if (typeof toolbar === 'string') {
        const { item, parent } = lookUp<IToolbar>(both(), toolbar);
        if (item && parent) return getToolbar(item, parent);
        return undefined as any;
      } else {
        const { item, parent } = lookUp<IToolbar>(both(), toolbar.id);
        if (item && parent) return getToolbar(item, parent);
        const { item: stackItem } = lookUp<IStack>(both(), stack);
        if (!isStack(stackItem)) return;

        const newToolbar: IToolbar = { type: NodeType.Toolbar, ...toolbar, members: toolbarMembers(toolbar) };
        set((state) => {
          const members = [...state.members];
          const floating = [...state.floating];
          stackItem.members.push(newToolbar);
          return { members, floating };
        });
        return getToolbar(newToolbar, stackItem);
      }
    }
  };
});
