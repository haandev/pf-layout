import { create } from 'zustand';
import { lookUp as _lookUp, lookUp } from '../util';
import { AsRegisterArgs, Direction, IContainer, IFloatingTool, IFloatingToolbarWindow, IToolbar, IToolbarStack, NestedState, NodeType } from '../types';
import { isContainer, isFloatingToolbarWindow, isToolbar, isToolbarStack } from '../guards';
import { PropsWithChildren } from 'react';
import { ToolbarStack } from '../blocks/ToolbarStack';
import { Toolbar } from '../blocks/Toolbar';
import { v4 } from 'uuid';
import { ContainerProps } from '../blocks/Container';
import FloatingTool from '../blocks/FloatingTool';

export interface LayoutStore {
  members: IContainer[];
  floating: IFloatingToolbarWindow[];
  //container actions
  containerProps: (id: string) => ContainerProps;
  registerContainer: (container: AsRegisterArgs<IContainer>) => void;
  dropOnContainer: (id: string, droppedItemId: string) => void;

  //stack actions
  toolbarStackProps: (id: string) => PropsWithChildren<Pick<IToolbarStack, 'id' | 'direction' | 'maxItems'>>;
  registerToolbarStack: (stackGroup: string, stack: AsRegisterArgs<IToolbarStack>) => void;
  detachToolbarStack: (id: string, x: number, y: number) => void;
  attachToolbarStack: (id: string, containerId: string) => void;

  //floating toolbar window actions
  moveFloatingToolbarWindow: (id: string, x: number, y: number) => void;
  floatingToolbarWindowProps: (id: string) => PropsWithChildren<Pick<IFloatingToolbarWindow, 'id' | 'top' | 'left' | 'zIndex' | 'hidden'>>;

  //toolbar actions
  toolbarProps: (id: string) => PropsWithChildren<Pick<IToolbar, 'id' | 'direction'>>;
  registerToolbar: (stack: string, toolbar: AsRegisterArgs<IToolbar>) => void;
  setToolbarAttributes: (id: string, attributes: Partial<IToolbar>) => void;
  getToolbarAttribute: (id: string, attribute: keyof IToolbar) => any;
}

export const useLayout = create<LayoutStore>((set, get) => {
  const both = () => ({ members: [...get().members, ...get().floating] }) as NestedState;
  return {
    members: [],
    floating: [],
    moveFloatingToolbarWindow: (id, xDelta, yDelta) => {
      return set((state) => {
        const members = [...state.members];
        const { item } = lookUp<IFloatingToolbarWindow>(state, id);
        if (!isFloatingToolbarWindow(item)) return state;
        item.top = (item.top || 0) + yDelta;
        item.left = (item.left || 0) + xDelta;
        return { members };
      });
    },
    dropOnContainer: (id, droppedItemId) => {
      set((state) => {
        const members = [...state.members];
        const { item: container } = lookUp<IContainer>(state, id);
        const { item: droppedItem } = lookUp(both(), droppedItemId);
        if (!isContainer(container)) return state;
        if (isToolbarStack(droppedItem)) {
          get().attachToolbarStack(droppedItem.id, container.id);
        } else if (isFloatingToolbarWindow(droppedItem)) {
          container.members.push(...droppedItem.members);
        }
        return { members };
      });
    },
    toolbarProps: (id) => {
      const { item, parent } = lookUp<IToolbar>(both(), id);
      if (!isToolbar(item)) return { id: '', direction: Direction.Vertical };

      const onClickHandler = (id: string) => {
        set((state) => {
          const members = [...state.members];
          const floating = [...state.floating];
          if (!isToolbarStack(parent)) return { members, floating };
          parent.activeFloatingToolId = id;
          return { members, floating };
        });
      };
      const floatingTools = item.members.map((tool) => {
        return <FloatingTool key={tool.id} {...tool} value={parent?.activeFloatingToolId} onClick={() => onClickHandler(tool.id)} />;
      });

      const props: PropsWithChildren<Pick<IToolbar, 'id' | 'direction'>> = { ...item, children: [item.content, floatingTools] };
      return props;
    },
    toolbarStackProps: (id) => {
      const { item } = lookUp<IToolbarStack>(both(), id);
      if (!isToolbarStack(item)) return { id: '', direction: Direction.Vertical, maxItems: 1 };

      const children = item.members.map((toolbar) => {
        const toolbarProps = get().toolbarProps(toolbar.id);
        return <Toolbar {...toolbarProps} key={toolbar.id} />;
      });
      const props: PropsWithChildren<Pick<IToolbarStack, 'id' | 'direction' | 'maxItems'>> = { ...item, children };
      return props;
    },
    containerProps: (id) => {
      const { item } = lookUp<IContainer>(both(), id);
      if (!isContainer(item)) {
        return { id, maxItems: 1, children: [], direction: Direction.Vertical };
      }
      const children = item.members.map((toolbarStack) => {
        const toolbarStackProps = get().toolbarStackProps(toolbarStack.id);
        return <ToolbarStack {...toolbarStackProps} key={toolbarStack.id} />;
      });

      const props: ContainerProps = {
        ...item,
        onDrop: (id: string, containerId: string) => {
          get().dropOnContainer(containerId, id);
        },
        children: children
      };
      return props;
    },
    floatingToolbarWindowProps: (id) => {
      const { item } = lookUp<IFloatingToolbarWindow>(get().floating, id);
      if (!isFloatingToolbarWindow(item)) {
        return { id, top: 0, left: 0, zIndex: 0, hidden: false, members: [] };
      }
      const children = item.members.map((stack) => {
        const stackProps = get().toolbarStackProps(stack.id);
        return <ToolbarStack {...stackProps} key={stack.id} />;
      });

      const props: PropsWithChildren<Pick<IFloatingToolbarWindow, 'id' | 'top' | 'left' | 'zIndex' | 'hidden'>> = {
        id: item.id,
        top: item.top || 0,
        left: item.left || 0,
        zIndex: item.zIndex || 0,
        hidden: item.hidden || false,
        children
      };
      return props;
    },
    registerContainer: (container) => {
      set((state) => {
        const members = [...state.members];
        const { item } = lookUp<IContainer>(state, container.id);
        if (item) return state;
        members.push({
          type: NodeType.Container,
          ...container,
          members: containerMembers(container)
        });
        return { members };
      });
    },
    registerToolbarStack: (containerId, stack) => {
      set((state) => {
        const members = [...state.members];
        const floating = [...state.floating];
        const { item: container } = lookUp<IContainer>(state, containerId);
        const { item: floatingWindow } = lookUp<IFloatingToolbarWindow>(state.floating, containerId);
        const { item } = lookUp<IToolbarStack>(both(), stack.id);
        if (item) return state;
        const newStack: IToolbarStack = { type: NodeType.ToolbarStack, ...stack, members: toolbarStackMembers(stack) };
        if (isContainer(container)) {
          container.members.push(newStack);
          return { members };
        } else if (isFloatingToolbarWindow(floatingWindow)) {
          floatingWindow.members.push(newStack);
          return { floating };
        } else return state;
      });
    },
    detachToolbarStack: (id, x, y) => {
      set((state) => {
        const members = [...state.members];
        const floating = [...state.floating];
        const { item: stack, parent: container } = lookUp<IToolbarStack>(both(), id);
        if (!isToolbarStack(stack) || !container) return state;
        container.members = container.members.filter((item) => item.id !== stack.id);

        const newFloatingToolbarWindow: IFloatingToolbarWindow = {
          type: NodeType.FloatingToolbarWindow,
          id: v4(),
          members: [stack],
          top: y,
          left: x
        };
        floating.push(newFloatingToolbarWindow);

        return { members, floating: floating.filter((item) => item.members.length > 0) };
      });
    },
    attachToolbarStack: (id, containerId) => {
      set((state) => {
        const members = [...state.members];
        let floating = [...state.floating];
        const { item: stack, parent: floatingWindow } = lookUp<IToolbarStack>(both(), id);
        const { item: container } = lookUp<IContainer>(state, containerId);
        if (!isToolbarStack(stack) || !isContainer(container) || !floatingWindow) return state;
        floatingWindow.members = floatingWindow.members.filter((item) => item.id !== stack.id);
        container.members.push(stack);
        floating = floating.filter((item) => item.members.length > 0);
        return { members, floating };
      });
    },
    registerToolbar: (stack, toolbar) => {
      set((state) => {
        const members = [...state.members];
        const floating = [...state.floating];
        const { item: toolbarStack } = lookUp<IToolbarStack>(both(), stack);
        const { item } = lookUp<IToolbar>(both(), toolbar.id);
        if (item) return state;
        if (!isToolbarStack(toolbarStack)) return state;
        const newToolbar: IToolbar = { type: NodeType.Toolbar, ...toolbar, members: toolbarMembers(toolbar) };
        toolbarStack.members.push(newToolbar);
        return { members, floating };
      });
    },
    setToolbarAttributes: (id, attributes) => {
      set((state) => {
        const members = [...state.members];
        const floating = [...state.floating];
        const { item } = lookUp<IToolbar>(both(), id);
        if (!isToolbar(item)) return state;
        Object.assign(item, attributes);
        return { members, floating };
      });
    },
    getToolbarAttribute: (id, attribute) => {
      const { item } = lookUp<IToolbar>(both(), id);
      if (!isToolbar(item)) return null;
      return item[attribute];
    }
  };
});

const toolbarMembers = (toolbar: AsRegisterArgs<IToolbar>): IFloatingTool[] => {
  return (toolbar.members || []).map((tool) => ({ type: NodeType.FloatingTool, ...tool }));
};
const toolbarStackMembers = (stack: AsRegisterArgs<IToolbarStack>): IToolbar[] => {
  return (stack.members || []).map((toolbar) => ({ type: NodeType.Toolbar, ...toolbar, members: [] }));
};
/*
const FloatingToolbarWindowMembers = (stackGroup: AsRegisterArgs<IFloatingToolbarWindow>): IToolbarStack[] => {
  return (stackGroup.members || []).map((stack) => ({
    type: NodeType.ToolbarStack,
    ...stack,
    members: toolbarStackMembers(stack)
  }));
}; */

const containerMembers = (container: AsRegisterArgs<IContainer>): IToolbarStack[] => {
  return (container.members || []).map((toolbarStack) => ({
    type: NodeType.ToolbarStack,
    ...toolbarStack,
    members: toolbarStackMembers(toolbarStack)
  }));
};
