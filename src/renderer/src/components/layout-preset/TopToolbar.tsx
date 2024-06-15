import React from 'react';
import { IconButton, Label, Separator, ToolbarItem } from '../application-layout';
import { AppToolsStickySvgButton } from './AppStickyButton';

import selectionTool from '../../icons/illustrator/selection-tool.svg';
import zoom from '../../icons/illustrator/zoom.svg';
import zoomIn from '../../icons/illustrator/zoom-in.svg';
import zoomOut from '../../icons/illustrator/zoom-out.svg';
import IconHome from '../../icons/IconHome';
import IconSave from '../../icons/IconSave';
import IconFolderOpen from '../../icons/IconFolderOpen';
import InlineSvg from '../application-layout/elements/InlineSvg';

const TopToolbar = React.memo(() => {
  const app = {} as any; // tempoprary
  return (
    <>
      <ToolbarItem children={<IconButton children={<IconHome />} onClick={app.showHome} />} />
      <Separator />
      <ToolbarItem children={<Label>Nothing selected</Label>} />
      <Separator />
      <ToolbarItem children={<IconButton children={<IconSave />} />} />
      <ToolbarItem children={<IconButton children={<IconFolderOpen />} />} />
      <ToolbarItem children={<AppToolsStickySvgButton source={selectionTool} name="selection" />} />
      <Separator />
      <ToolbarItem children={<IconButton onClick={() => app.flow?.zoomIn()} children={<InlineSvg source={zoomIn} />} />} />
      <ToolbarItem children={<IconButton onClick={() => app.flow?.zoomOut()} children={<InlineSvg source={zoomOut} />} />} />
      <ToolbarItem children={<IconButton onClick={() => app.flow?.fitView()} children={<InlineSvg source={zoom} />} />} />
    </>
  );
});

export default TopToolbar;
