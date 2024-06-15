import { create } from 'zustand';
import { generateRandomCoordinates, lookUp as _lookUp, nextZIndex, lookUp } from '../util';
import { AsRegisterArgs, Direction, IContainer, IFloatingToolbarWindow, IToolbar, IToolbarStack, NestedState, NodeType, StateItem } from '../types';
import { isContainer, isFloatingToolbarWindow, isToolbar, isToolbarStack } from '../guards';
import React, { PropsWithChildren } from 'react';
import { ToolbarStack } from '../blocks/ToolbarStack';
import { Toolbar } from '../blocks/Toolbar';
import { v4 } from 'uuid';

export interface LayoutStore {
  members: IContainer[];
  floating: IFloatingToolbarWindow[];
  //container actions
  containerProps: (id: string) => PropsWithChildren<Pick<IContainer, 'id' | 'maxItems'>>;
  registerContainer: (container: AsRegisterArgs<IContainer>) => void;

  //stack actions
  toolbarStackProps: (id: string) => PropsWithChildren<Pick<IToolbarStack, 'id' | 'direction' | 'maxItems'>>;
  registerToolbarStack: (stackGroup: string, stack: AsRegisterArgs<IToolbarStack>) => void;
  detachToolbarStack: (id: string, x: number, y: number) => void;

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
    toolbarProps: (id) => {
      const { item } = lookUp<IToolbar>(both(), id);
      if (!isToolbar(item)) return { id: '', direction: Direction.Vertical };

      const props: PropsWithChildren<Pick<IToolbar, 'id' | 'direction'>> = { ...item, children: [item.content] };
      return props;
    },
    toolbarStackProps: (id) => {
      const { item } = lookUp<IToolbarStack>(both(), id);
      if (!isToolbarStack(item)) return { id: '', direction: Direction.Vertical, maxItems: 1 };

      const children = item.members.map((toolbar) => {
        const toolbarProps = get().toolbarProps(toolbar.id);
        return <Toolbar {...toolbarProps} />;
      });
      const props: PropsWithChildren<Pick<IToolbarStack, 'id' | 'direction' | 'maxItems'>> = { ...item, children };
      return props;
    },
    containerProps: (id) => {
      const { item } = lookUp<IContainer>(both(), id);
      if (!isContainer(item)) {
        return { id, maxItems: 1, children: [] };
      }
      const children = item.members.map((toolbarStack) => {
        const toolbarStackProps = get().toolbarStackProps(toolbarStack.id);
        return <ToolbarStack {...toolbarStackProps} />;
      });

      const props: Pick<IContainer, 'id' | 'maxItems'> & { children: React.ReactNode } = {
        id: item.id,
        maxItems: item.maxItems,
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
        return <ToolbarStack {...stackProps} />;
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
          left: x,
          zIndex: nextZIndex(state.floating)
        };
        floating.push(newFloatingToolbarWindow);

        return { members, floating };
      });
    },
    registerToolbar: (stack, toolbar) => {
      set((state) => {
        const members = [...state.members];
        const floating = [...state.floating];
        const { item: toolbarStack } = lookUp<IToolbarStack>(both(), stack);
        if (!isToolbarStack(toolbarStack)) return state;
        const newToolbar: IToolbar = { type: NodeType.Toolbar, ...toolbar, members: [] };
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
