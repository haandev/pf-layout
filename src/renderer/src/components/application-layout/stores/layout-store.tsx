import { create } from 'zustand';
import { LookupResult, lookUp as _lookUp, lookUp } from '../util';
import {
  AsRegisterArgs,
  Direction,
  GatheredContainer,
  IContainer,
  IPanel,
  IToolbarWindow,
  IToolbar,
  IToolbarStack,
  NodeType,
  StateItem,
  GatheredStack,
  Maybe,
  GatheredToolbar,
  GatheredToolbarWindow
} from '../types';
import { isContainer, isToolbarWindow, isToolbar, isToolbarStack, isString } from '../guards';
import { PropsWithChildren } from 'react';
import { ToolbarStack } from '../blocks/ToolbarStack';
import { Toolbar } from '../blocks/Toolbar';
import { v4 } from 'uuid';
import { ContainerProps } from '../blocks/Container';
import Panel from '../blocks/Panel';

export interface LayoutStore {
  members: IContainer[];
  floating: IToolbarWindow[];
  //container actions

  /**
   * Retrieves a container with the given id or creates a new one if it doesn't exist.
   * To create a new container, pass an object with the container's properties.
   * @param toolbarWindow - The id of the toolbarWindow or an object with the toolbarWindow's properties.
   * @returns The GatheredToolbarWindow that also has the methods to manipulate the toolbarWindow.
   */
  toolbarWindow: <T extends string | AsRegisterArgs<IToolbarWindow>>(
    toolbarWindow: T
  ) => T extends string ? Maybe<GatheredToolbarWindow> : GatheredToolbarWindow;

  /**
   * Retrieves a container with the given id or creates a new one if it doesn't exist.
   * To create a new container, pass an object with the container's properties.
   * @param container - The id of the container or an object with the container's properties.
   * @returns The GatheredContainer that also has the methods to manipulate the container.
   */
  container: <T extends string | AsRegisterArgs<IContainer>>(
    container: T
  ) => T extends string ? Maybe<GatheredContainer> : GatheredContainer;

  /**
   * Retrieves a container with the given id or creates a new one if it doesn't exist.
   * To create a new container, pass an object with the container's properties.
   * @param stack - The id of the stack or an object with the stack's properties.
   * @param hostId - The id of the container where the stack will be placed.
   * @returns The GatheredStack that also has the methods to manipulate the stack.
   */
  toolbarStack: <T extends string | AsRegisterArgs<IToolbarStack>>(
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
  toolbar: <T extends string | AsRegisterArgs<IToolbar>>(
    toolbar: T,
    stack?: string
  ) => T extends string ? Maybe<GatheredToolbar> : GatheredToolbar;

  lookUp: <T extends StateItem>(id: string | undefined) => LookupResult<T>;
  both: () => { members: (IContainer | IToolbarWindow)[] };
}

export const useLayout = create<LayoutStore>((set, get) => {
  const both = () => ({ members: [...get().members, ...get().floating] });
  //props generation
  const generateContainerProps = (item: IContainer): ContainerProps => {
    const children = item.members.map((toolbarStack) => {
      const toolbarStackProps = generateToolbarStackProps(toolbarStack);
      return (
        <ToolbarStack
          {...toolbarStackProps}
          chevronsPosition={item.chevronPosition}
          parentId={item.id}
          key={toolbarStack.id}
        />
      );
    });

    const props: ContainerProps = {
      ...item,
      onDrop: (id: string, type: NodeType, containerId: string) => {
        get().container(containerId)?.$dropOn(id, type);
      },
      children: children
    };
    return props;
  };
  const generateToolbarWindowProps = (item: IToolbarWindow) => {
    const children = item.members.map((stack) => {
      const stackProps = generateToolbarStackProps(stack);
      return (
        <ToolbarStack
          onClose={() => {
            const parent = get().toolbarStack(stack.id)?.$parent;
            if (parent?.type === NodeType.ToolbarWindow) return parent.$close();
          }}
          {...stackProps}
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
  const generateToolbarStackProps = (item: IToolbarStack) => {
    const children = item.members.map((toolbar) => {
      const toolbarProps = generateToolbarProps(toolbar, item);
      return <Toolbar {...toolbarProps} key={toolbar.id} />;
    });
    const props: PropsWithChildren<Pick<IToolbarStack, 'id' | 'direction' | 'maxItems'>> = { ...item, children };
    return props;
  };
  const generateToolbarProps = (item: IToolbar, parent: IToolbarStack) => {
    const onClickHandler = (id: string) => {
      set((state) => {
        const members = [...state.members];
        const floating = [...state.floating];
        if (!isToolbarStack(parent)) return { members, floating };
        parent.activePanelId = id;
        return { members, floating };
      });
    };
    const panels = item.members.map((tool) => {
      return <Panel key={tool.id} {...tool} value={parent?.activePanelId} onClick={() => onClickHandler(tool.id)} />;
    });

    const props: PropsWithChildren<Pick<IToolbar, 'id' | 'direction'>> = { ...item, children: [item.content, panels] };
    return props;
  };

  //members generation
  const toolbarMembers = (toolbar: AsRegisterArgs<IToolbar>): IPanel[] => {
    return (toolbar.members || []).map((tool) => ({ type: NodeType.Panel, ...tool }));
  };
  const toolbarStackMembers = (stack: AsRegisterArgs<IToolbarStack>): GatheredToolbar[] => {
    const typedMembers = (stack.members || []).map((toolbar) => ({
      ...toolbar,
      type: NodeType.Toolbar as NodeType.Toolbar,
      members: toolbarMembers(toolbar)
    }));
    const typedStack = { ...stack, type: NodeType.ToolbarStack as NodeType.ToolbarStack, members: typedMembers };
    return typedMembers.map((toolbar) => toolbarMethods(toolbar, typedStack));
  };
  const toolbarWindowMembers = (toolbarWindow: AsRegisterArgs<IToolbarWindow>): GatheredStack[] => {
    const typedMembers = (toolbarWindow.members || []).map((stack) => ({
      ...stack,
      type: NodeType.ToolbarStack as NodeType.ToolbarStack,
      members: toolbarStackMembers(stack)
    }));
    const typedWindow = {
      ...toolbarWindow,
      type: NodeType.ToolbarWindow as NodeType.ToolbarWindow,
      members: typedMembers
    };
    return typedMembers.map((stack) => stackMethods(stack, typedWindow));
  };
  const containerMembers = (container: AsRegisterArgs<IContainer>): GatheredStack[] => {
    const typedMembers = (container.members || []).map((stack) => ({
      ...stack,
      type: NodeType.ToolbarStack as NodeType.ToolbarStack,
      members: toolbarStackMembers(stack)
    }));
    const typedContainer = {
      ...container,
      type: NodeType.Container as NodeType.Container,
      members: typedMembers
    };
    return typedMembers.map((stack) => stackMethods(stack, typedContainer));
  };

  //gather item with methods
  const toolbarWindowMethods = (toolbarWindow?: IToolbarWindow): GatheredToolbarWindow => {
    if (!toolbarWindow) toolbarWindow = { type: NodeType.ToolbarWindow, id: v4(), members: [] };
    return {
      ...toolbarWindow,
      get $props() {
        return generateToolbarWindowProps(toolbarWindow);
      },
      $stack: (stack) => get().toolbarStack(stack, toolbarWindow.id),
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
  const containerMethods = (container?: IContainer): GatheredContainer => {
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
        return generateContainerProps(container);
      },
      $stack: (stack) => get().toolbarStack(stack, container.id),
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
          if (droppedItemType === NodeType.ToolbarStack) {
            get().toolbarStack(droppedItemId)?.$attach(container.id);
          } else if (droppedItemType === NodeType.ToolbarWindow) {
            const toolbarWindow = get().toolbarWindow(droppedItemId);
            if (!toolbarWindow) return state;
            container.members.push(...toolbarWindow.members);
            toolbarWindow.$close();
          }
          return { members };
        });
      }
    };
  };
  const stackMethods = (stack: IToolbarStack, parent?: IToolbarWindow | IContainer): GatheredStack => {
    return {
      ...stack,
      get members() {
        return toolbarStackMembers(stack);
      },
      get $props() {
        return generateToolbarStackProps(stack);
      },
      get $parent() {
        return parent ? (isContainer(parent) ? containerMethods(parent) : toolbarWindowMethods(parent)) : undefined;
      },
      $toolbar: (toolbar) => get().toolbar(toolbar, stack.id),
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
          const { parent } = lookUp<IToolbarStack>(both(), stack.id);
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
          const { parent } = lookUp<IToolbarStack>(both(), stack.id);
          if (!isContainer(container)) return state;
          parent && (parent.members = parent.members.filter((item) => item.id !== stack.id));
          container.members.push(stack);
          return { members, floating };
        });
      }
    };
  };
  const toolbarMethods = (toolbar: IToolbar, parent: IToolbarStack): GatheredToolbar => {
    return {
      ...toolbar,
      get $props() {
        return generateToolbarProps(toolbar, parent);
      },
      get $parent() {
        return stackMethods(parent, undefined);
      },
      $panel: (panel) => lookUp<IPanel>(get().both(), panel),
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
    both,
    members: [],
    floating: [],
    toolbarWindow: (toolbarWindow) => {
      if (typeof toolbarWindow === 'string') {
        const { item } = lookUp<IToolbarWindow>(get().floating, toolbarWindow);
        if (item) return toolbarWindowMethods(item);
        return toolbarWindowMethods(); //default empty toolbar window
      } else {
        const { item } = lookUp<IToolbarWindow>(get().floating, toolbarWindow.id);
        if (item) return toolbarWindowMethods(item);
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
        return toolbarWindowMethods(newToolbarWindow);
      }
    },
    container: (container) => {
      if (typeof container === 'string') {
        const { item } = lookUp<IContainer>(get(), container);
        if (item) return containerMethods(item);
        return undefined as any; //possibly typescript issue
      } else {
        const { item } = lookUp<IContainer>(get(), container.id);
        if (item) return containerMethods(item);
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
        return containerMethods(newContainer);
      }
    },
    toolbarStack: (stack, hostId) => {
      if (isString(stack)) {
        const { item, parent } = lookUp<IToolbarStack>(both(), stack);
        if (item && parent) return stackMethods(item, parent);
        return undefined as any;
      } else {
        const { item, parent } = lookUp<IToolbarStack>(both(), stack.id);
        if (item && parent) return stackMethods(item, parent);
        const { item: host } = lookUp<IContainer>(both(), hostId);
        if (!isContainer(host) && !isToolbarWindow(host)) throw new Error('Invalid host');

        const newStack: IToolbarStack = { type: NodeType.ToolbarStack, ...stack, members: toolbarStackMembers(stack) };
        set((state) => {
          const members = [...state.members];
          host.members.push(newStack);
          return { members };
        });
        return stackMethods(newStack, host);
      }
    },
    toolbar: (toolbar, stack) => {
      //potential best solution for this type of operations
      if (typeof toolbar === 'string') {
        const { item, parent } = lookUp<IToolbar>(both(), toolbar);
        if (item && parent) return toolbarMethods(item, parent);
        return undefined as any;
      } else {
        const { item, parent } = lookUp<IToolbar>(both(), toolbar.id);
        if (item && parent) return toolbarMethods(item, parent);
        const { item: toolbarStack } = lookUp<IToolbarStack>(both(), stack);
        if (!isToolbarStack(toolbarStack)) return;

        const newToolbar: IToolbar = { type: NodeType.Toolbar, ...toolbar, members: toolbarMembers(toolbar) };
        set((state) => {
          const members = [...state.members];
          const floating = [...state.floating];
          toolbarStack.members.push(newToolbar);
          return { members, floating };
        });
        return toolbarMethods(newToolbar, toolbarStack);
      }
    },

    lookUp: <T extends StateItem>(id: string | undefined) => {
      return lookUp<T>(both(), id);
    }
  };
});
