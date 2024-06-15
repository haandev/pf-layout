import { create } from 'zustand';
import { generateRandomCoordinates, lookUp, nextZIndex } from '../util';
import { IToolbarStackGroup, NodeType } from '../types';
import { isToolbarStackGroup } from '../guards';
import { ToolbarStackGroupProps } from '../blocks/ToolbarStackGroup';
import { v4 } from 'uuid';

export interface LayoutStore {
  members: IToolbarStackGroup[];
  moveToolbarStackGroup: (id: string, x: number, y: number) => void;
  toolbarStackGroupProps: (id: string) => ToolbarStackGroupProps;
}

export const useLayout = create<LayoutStore>((set, get) => ({
  members: [
    {
      type: NodeType.ToolbarStackGroup,
      id: 'main-tools-stack-group',
      floating: true,
      top: 200,
      left: 200
    }
  ] as unknown as IToolbarStackGroup[],
  moveToolbarStackGroup: (id, xDelta, yDelta) =>
    {
      console.log("moveToolbarStackGroup", id, xDelta, yDelta)
      return set((state) => {
        const members = [...state.members];
        const { item } = lookUp<IToolbarStackGroup>(state, id);
        if (!isToolbarStackGroup(item)) return state;
        item.top = (item.top || 0) + yDelta;
        item.left = (item.left || 0) + xDelta;
        return { members };
      });
    },
  toolbarStackGroupProps: (id) => {
    const { item } = lookUp<IToolbarStackGroup>(get(), id);
    if (!isToolbarStackGroup(item)) {
      const randomPosition = generateRandomCoordinates();
      set((state) => {
        const zIndex = nextZIndex(state);
        const newToolbarStackGroup: IToolbarStackGroup = {
          type: NodeType.ToolbarStackGroup,
          id: id,
          floating: false,
          top: randomPosition.y,
          left: randomPosition.x,
          zIndex
        };
        const members = [...state.members];
        members.push(newToolbarStackGroup);
        return { members };
      });
      return { id, floating: false, top: randomPosition.y, left: randomPosition.x };
    }
    const props: ToolbarStackGroupProps = {
      id: item.id,
      floating: item.floating,
      top: item.top,
      left: item.left
    };
    return props;
  }
}));
