import { CSSProperties, FC, useRef } from 'react';
import { StickyGroupButton, ToolbarItem, getMargins } from '../application-layout';
import { useApp } from '../../stores/app-store';
import InlineSvg from '../application-layout/elements/InlineSvg';
import { useLayout } from '../application-layout/stores/layout-store';
import { Direction } from '../application-layout/types';
import { isContainer, isToolbarWindow } from '../application-layout/guards';
import { AppToolsStickySvgButton } from './AppStickyButton';

export interface AppStickyGroupButtonProps {
  /**
   * if not specified, it will be join of keys of items object with coma
   */
  id?: string;
  items: Record<
    string,
    {
      source: string | URL | Request;
      label: string;
    }
  >;
}
export const AppStickyGroupButton: FC<AppStickyGroupButtonProps> = ({ items, id }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const _id = id || Object.keys(items).join(',');
  const app = useApp();
  const layout = useLayout();

  const renderItems = Object.fromEntries(
    Object.entries(items).map(([key, value]) => {
      return [
        key,
        {
          render: <InlineSvg source={value.source} width={16} height={16} />,
          label: value.label
        }
      ];
    })
  );

  const onDetach = () => {
    const windowId = `${_id}--window`;
    const stackId = `${_id}--stack`;
    const toolbarId = `${_id}--toolbar`;

    const toolbarItems = (
      <>
        {Object.entries(items).map(([key, value]) => {
          return (
            <ToolbarItem>
              <AppToolsStickySvgButton source={value.source} name={key} />
            </ToolbarItem>
          );
        })}
      </>
    );
    const stack = layout.$stack(stackId);
    const parent = stack?.$parent;
    if (isContainer(parent)) {
      //nothing, already attached
      layout.$toolbar(toolbarId)?.$set({ columns: Object.keys(items).length });
      return;
    } else if (isToolbarWindow(parent)) {
      layout.$toolbarWindow(parent.id)?.$close();
    }
    const newPosition: CSSProperties = {};
    if (ref.current) {
      const margins = getMargins(ref.current);

      if (margins?.leftSideOfScreen) {
        newPosition.left = margins.right;
      } else {
        newPosition.left = (margins?.left || 0) - 300;
      }
      if (margins?.topSideOfScreen) {
        newPosition.top = margins.top + margins.height;
      } else {
        newPosition.top = (margins?.top || 0) - 500;
      }
    }

    layout
      .$toolbarWindow({
        id: windowId,
        top: Number(newPosition.top) || 0,
        left: Number(newPosition.left) || 0
      })
      ?.$stack({
        id: stackId,
        draggable: true,
        direction: Direction.Vertical,
        onCollapse: () => layout.$toolbar(toolbarId)?.$set({ columns: 1 }),
        onExpand: () => layout.$toolbar(toolbarId)?.$set({ columns: Object.keys(items).length }),
        isExpanded: () => layout.$toolbar(toolbarId)?.columns === Object.keys(items).length
      })
      ?.$toolbar({
        id: toolbarId,
        fullSize: true,
        content: toolbarItems,
        columns: Object.keys(items).length,
        direction: Direction.Vertical,
        showHandle: true
      });
  };

  return (
    <StickyGroupButton
      ref={ref}
      items={renderItems}
      value={app.tool}
      onChange={app.setTool}
      id={_id}
      detachable
      onDetach={onDetach}
    />
  );
};
