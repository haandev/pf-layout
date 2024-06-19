import React, { FC } from 'react';
import { GatheredToolbar } from '../../types';
import { noDrag } from '../../utils';
import clsx from 'clsx';
import IconArrowsExpand from '../../icons/IconArrowsExpand';
import IconArrowsCollapse from '../../icons/IconArrowsCollapse';

export interface PanelHostProps {
  toolbarInstance?: GatheredToolbar;
}
const PanelHost: FC<PanelHostProps> = ({ toolbarInstance }) => {
  const parent = toolbarInstance?.$parent;
  const panel = toolbarInstance?.lastUsedPanelId
    ? toolbarInstance?.$panel(toolbarInstance.lastUsedPanelId)
    : parent?.activePanelId
      ? toolbarInstance?.$panel(parent?.activePanelId)
      : null;

  const willRenderPanel = parent?.as === 'tabs' ? true : panel && panel.id === parent?.activePanelId;
  return willRenderPanel ? (
    <div className="pf-panel-host" {...noDrag}>
      <div className="pf-panel-host-header">
        {toolbarInstance?.members?.map((member) => {
          return (
            <div
              key={member.id}
              className={clsx({
                'pf-panel-host-header-item': true,
                'pf-active': member.id === toolbarInstance?.lastUsedPanelId
              })}
              onClick={() => {
                toolbarInstance?.$set({ lastUsedPanelId: member.id });
                toolbarInstance?.$parent?.$set({ activePanelId: member.id });
              }}
            >
              {member.compactContent && (
                <button onClick={() => member.$toggleVisibility(toolbarInstance.$parent?.as || 'toolbar')}>
                  {member.visibility === 'collapsed' ||
                  (member.visibility === 'compact' && toolbarInstance.$parent?.as !== 'tabs') ? (
                    <IconArrowsExpand width={8} />
                  ) : (
                    <IconArrowsCollapse width={8} />
                  )}
                </button>
              )}

              {member.title}
            </div>
          );
        })}
      </div>
      <div className="pf-panel-compact-content">
        {panel?.visibility !== 'collapsed' ||
        (panel?.visibility === 'collapsed' && toolbarInstance?.$parent?.as !== 'tabs')
          ? panel?.compactContent
          : null}
      </div>
      <div className="pf-panel-content">
        {(panel?.visibility === 'full' || !panel?.visibility) && (panel?.content || null)}
      </div>
    </div>
  ) : null;
};

export default PanelHost;
